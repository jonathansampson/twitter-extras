import { Feature } from "../types";

const name = "Format Code Blocks";
const identifier = "formatCodeBlocks";
const description = "Formats inline code blocks.";

let enabled = false;
const codeBlockRegEx = /(?<!`)(`[^`]*`)(?!`)/g;
let mutationObserver: MutationObserver | null = null;

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

const enable = () => {
  if (enabled) {
    return;
  }

  enabled = true;

  const selector = "[data-testid='tweetText']";

  // Process all existing code blocks
  for (const tweetText of document.querySelectorAll(selector)) {
    if (tweetText instanceof HTMLElement) {
      processInlineCode(tweetText);
    }
  }

  // Listen for, and process, new code blocks
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          const tweetText = node.querySelector(selector);
          if (tweetText instanceof HTMLElement) {
            processInlineCode(tweetText);
          }
        }
      }
    }
  });

  mutationObserver = observer;
  observer.observe(document.body, { childList: true, subtree: true });
};

const disable = () => {
  if (!enabled) {
    return;
  }

  // Disable feature and disconnect the observer
  enabled = false;
  mutationObserver?.disconnect();
  mutationObserver = null;

  // Revert all code blocks to their original state
  for (const code of document.querySelectorAll("code")) {
    const text = code.textContent as string;
    const content = document.createTextNode(`\`${text}\``);
    code.parentNode?.replaceChild(content, code);
  }
};

const feature: Feature = {
  name,
  identifier,
  description,
  enable,
  disable,
  get enabled() {
    return enabled;
  },
};

export default feature;
