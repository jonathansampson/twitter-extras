export const name = "Format Code Blocks";
export const identifier = "formatCodeBlocks";
export const description = "Formats inline code blocks.";

export let enabled = false;

const codeBlockRegEx = /(?<!`)(`[^`]*`)(?!`)/g;

export const enable = () => {
  if (enabled) {
    return;
  }

  enabled = true;
};

export const disable = () => {
  if (!enabled) {
    return;
  }

  enabled = false;
  revertCodeBlocks();
};

export const onAddedNodes = (nodes: NodeList) => {
  if (!enabled) {
    return;
  }
  for (const node of nodes) {
    if (node instanceof HTMLElement) {
      const tweetText = node.querySelector("[data-testid='tweetText']");
      if (tweetText instanceof HTMLElement) {
        processInlineCode(tweetText);
      }
    }
  }
}

const revertCodeBlocks = () => {
  // Revert all code blocks to their original state
  for (const code of document.querySelectorAll("[data-testid='tweetText'] code")) {
    const text = code.textContent as string;
    const content = document.createTextNode(`\`${text}\``);
    code.parentNode?.replaceChild(content, code);
  }
};

const processInlineCode = (box: HTMLElement) => {
  // Create a text walker to access every text node
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);

  // Collect the nodes
  while (walker.nextNode()) {
    nodes.push(walker.currentNode as Text);
  }

  // Examine each of the nodes
  for (const node of nodes) {
    const text = node.textContent as string;
    const parts = text.split(codeBlockRegEx);

    // Process nodes with code blocks
    if (parts.length > 1) {
      const fragment = document.createDocumentFragment();
      for (const part of parts) {
        if (part.startsWith("`") && part.endsWith("`")) {
          const code = document.createElement("code");

          code.style.padding = "0.15em";
          code.style.fontSize = "0.85em";
          code.style.color = "rgb(255, 127, 80)";

          code.textContent = part.substring(1, part.length - 1);
          fragment.append(code);
          continue;
        }
        fragment.append(document.createTextNode(part));
      }
      node.parentNode?.replaceChild(fragment, node);
    }
  }
};
