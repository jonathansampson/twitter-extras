export const name = "Draggable Post Box";
export const identifier = "draggablePostBox";
export const description = "Makes the post box draggable.";

export let enabled = false;

export const enable = () => {
    if (enabled) {
        return;
    }

    enabled = true;
    addStyles();
};

export const disable = () => {
    if (!enabled) {
        return;
    }

    enabled = false;
    removeStyles();
};

export const onAddedNodes = (nodes: NodeList) => {
    if (!enabled) {
        return;
    }
    for (const node of nodes) {
        if (node instanceof HTMLElement) {

            const modal = findNewPostModal(node);

            if (!modal) {
                continue;
            }

            createDragHandle(modal);

        }
    }
};

let featureStyles: HTMLStyleElement | null = null;

const addStyles = () => {
    const id = `feature-${identifier}`;

    if (document.getElementById(id)) {
        return;
    }

    const element = document.createElement("style");

    element.id = id;

    element.textContent = `
        div.drag-handle {
            width: 13em; height: 0.5em;
            background: rgba(255, 255, 255, 0.25);
            position: absolute;
            top: 4px; right: 50%;
            border-radius: 0.25em;
            transform: translateX(50%);
            cursor: move;
            border: 1px solid rgba(0, 0, 0, 0.25);
            box-sizing: border-box;
        }
    `;

    featureStyles = document.head.appendChild(element);
}

const removeStyles = () => {
    if (featureStyles) {
        featureStyles.remove();
        featureStyles = null;
    }
}

const findNewPostModal = (node: HTMLElement): HTMLElement | null => {
    const input = node.querySelector("#layers [data-testid^='tweetTextarea']");
    const modalDialog = input?.closest("[aria-modal='true'][role='dialog']");

    return modalDialog instanceof HTMLElement ? modalDialog : null;
}

const createDragHandle = (modal: HTMLElement) => {
    const dragHandle = document.createElement("div");
    dragHandle.classList.add("drag-handle");
    modal.appendChild(dragHandle);

    /**
     * We'll start by first setting the position of the modal.
     * X, by default, give it a position of `relative`, and a
     * `top` of `5%`. We'll switch this to `absolute`, and set
     * the `top` and `left` according to its current position.
     */
    modal.style.position = "absolute";
    modal.style.top = modal.offsetTop + "px";
    modal.style.left = modal.offsetLeft + "px";

    /**
     * Next, we'll listen for the `mousedown` event, and start
     * the main part of our logic.
     */
    dragHandle.onmousedown = (event) => {
        event.preventDefault();

        /**
         * When the mouse is pressed down on the drag handle,
         * we will record the initial position of the mouse,
         * as well as the modal itself.
         */
        const mouseDownTop = event.clientY;
        const mouseDownLeft = event.clientX;

        const initialBoxTop = modal.offsetTop;
        const initialBoxLeft = modal.offsetLeft;

        /**
         * When the mouse has been moved, we'll get its new
         * location, and calculate the new position of the
         * modal. We calculate this by taking the difference
         * between the initial mouse position and the new one,
         * and adding that to the initial position of the modal.
         */
        const onMouseMove = (event: MouseEvent) => {
            event.preventDefault();

            const mouseMoveLeft = event.clientX;
            const mouseMoveTop = event.clientY;

            const newBoxTop = initialBoxTop + (mouseMoveTop - mouseDownTop);
            const newBoxLeft = initialBoxLeft + (mouseMoveLeft - mouseDownLeft);

            modal.style.top = newBoxTop + "px";
            modal.style.left = newBoxLeft + "px";
        };

        /**
         * When the mouse is released, we need only to do a bit
         * of cleanup.
         */
        const onMouseUp = (event: MouseEvent) => {
            event.preventDefault();

            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        /**
         * Start listening for the `mousemove` and `mouseup` events
         * at the document level.
         */
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };
}