/*!
*   Hugo Theme Stack
*
*   @author: Jimmy Cai
*   @website: https://jimmycai.com
*   @link: https://github.com/CaiJimmy/hugo-theme-stack
*/
import menu from './menu';
import createElement from './createElement';
import StackColorScheme from './colorScheme';
import { setupScrollspy } from './scrollspy';
import { setupSmoothAnchors } from './smoothAnchors';

let Stack = {
    init: () => {
        /**
         * Bind menu event
         */
        menu();

        const articleContent = document.querySelector('.article-content') as HTMLElement;
        if (articleContent) {
            setupSmoothAnchors();
            setupScrollspy();
        }

        /**
         * Add copy button to code block
        */
        const highlights = document.querySelectorAll('.article-content div.highlight');
        const copyText = `Copy`,
            copiedText = `Copied!`;

        const addCopyButton = (container: Element, codeBlock: Element) => {
            const copyButton = document.createElement('button');
            copyButton.textContent = copyText;
            copyButton.classList.add('copyCodeButton');
            container.appendChild(copyButton);

            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(codeBlock.textContent)
                    .then(() => {
                        copyButton.textContent = copiedText;

                        setTimeout(() => {
                            copyButton.textContent = copyText;
                        }, 1000);
                    })
                    .catch(err => {
                        alert(err)
                        console.log('Something went wrong', err);
                    });
            });
        };

        highlights.forEach(highlight => {
            const codeBlock = highlight.querySelector('code[data-lang]') ?? highlight.querySelector('code');
            if (!codeBlock) return;
            addCopyButton(highlight, codeBlock);
        });

        document.querySelectorAll('.article-content pre').forEach(pre => {
            if (pre.closest('.highlight')) return;
            const codeBlock = pre.querySelector('code');
            if (!codeBlock) return;
            (pre as HTMLElement).style.position = 'relative';
            addCopyButton(pre, codeBlock);
        });

        new StackColorScheme(document.getElementById('dark-mode-toggle')!);
    }
}

window.addEventListener('load', () => {
    setTimeout(function () {
        Stack.init();
    }, 0);
})

declare global {
    interface Window {
        createElement: any;
        Stack: any
    }
}

window.Stack = Stack;
window.createElement = createElement;