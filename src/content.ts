console.log("Twitter Extras is running…");

interface VideoVariant {
  bitrate?: number;
  content_type: string;
  url: string;
}

function downloadVideo(tweetPhoto: HTMLElement): void {
  if (tweetPhoto instanceof HTMLElement) {
    const properties = getVideoProps(tweetPhoto);

    if (properties) {
      const { authorScreenName, source, tweetId } = properties;

      if (source?.variants) {
        const variants = source.variants as VideoVariant[];

        let video = variants.reduce((prev, current) => {
          return (prev.bitrate || 0) > (current.bitrate || 0) ? prev : current;
        }, {} as VideoVariant);

        if (video.url) {
          const type = "downloadMedia";
          const data = { authorScreenName, tweetId, url: video.url };
          window.postMessage({ type, data }, "*");
        }
      }
    }
  }
}

function getVideoProps(container: HTMLElement): any {
  console.log("getVideoProps", container);
  const properties = getReactProps(container);
  if (properties) {
    const childProps = properties?.children?.props;
    if (childProps?.videoType) {
      return childProps;
    }
  }
  return null;
}

function getReactProps(
  element: HTMLElement & { [key: string]: any }
): any | null {
  for (const property of Object.getOwnPropertyNames(element)) {
    if (property.startsWith("__reactProps")) {
      return element[property];
    }
  }
  return null;
}

document.addEventListener("contextmenu", (event) => {
  event.stopPropagation();
  if (event.target instanceof HTMLElement) {
    const videoComponent = event.target.closest(
      "[data-testid='videoComponent']"
    );
    if (videoComponent instanceof HTMLElement) {
      addMenuItems(videoComponent);
    }
  }
});

function addMenuItems(videoComponent: HTMLElement): void {
  const baseMenuItem = videoComponent.querySelector("[role='menuitem']");

  if (baseMenuItem) {
    const template = baseMenuItem.cloneNode(true);
    const container = baseMenuItem.parentElement!;

    // Add our Download button
    if (container.querySelector("#twitter-extras-download") === null) {
      const downloadMenuItem = createMenuItem({
        template,
        label: "Download Media",
        identifier: "twitter-extras-download",
        handler: () => {
          downloadVideo(videoComponent.closest("[data-testid='tweetPhoto']")!);
        },
      });

      container.appendChild(downloadMenuItem);
    }

    // Add our Picture-in-Picture button
    if (container.querySelector("#twitter-extras-pip") === null) {
      const pipMenuItem = createMenuItem({
        template,
        label: "Picture-in-Picture",
        identifier: "twitter-extras-pip",
        handler: () => {
          const video = videoComponent.querySelector("video");
          if (video) {
            video.removeAttribute("disablepictureinpicture");
            video.requestPictureInPicture();
          }
        },
      });

      container.appendChild(pipMenuItem);
    }
  }
}

function createMenuItem({
  template,
  identifier,
  label,
  handler,
}: any): HTMLElement {
  const button = template.cloneNode(true) as HTMLElement;
  const span = button.querySelector("span")!;

  button.id = identifier;
  span.textContent = label;

  button.addEventListener("click", handler);

  return button;
}
