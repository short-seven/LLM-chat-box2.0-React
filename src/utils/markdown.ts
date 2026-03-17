import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
//@ts-ignore
import mdLinkAttributes from 'markdown-it-link-attributes';
//@ts-ignore
import { full as emoji } from 'markdown-it-emoji';
import 'highlight.js/styles/atom-one-dark.css';
import copyIcon from '../assets/photo/复制.png';
import darkIcon from '../assets/photo/暗黑模式.png';
import lightIcon from '../assets/photo/明亮模式.png';

// Create markdown-it instance
const md: MarkdownIt = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
        return `<div class="code-block"><div class="code-header"><span class="code-lang">${lang}</span><div class="code-actions"><button class="code-action-btn" data-action="copy" data-tooltip="复制"><img src="${copyIcon}" alt="copy" /></button><button class="code-action-btn" data-action="theme" data-tooltip="切换主题"><img src="${darkIcon}" alt="theme" data-light-icon="${lightIcon}" data-dark-icon="${darkIcon}" /></button></div></div><pre class="hljs"><code>${highlighted}</code></pre></div>`;
      } catch (__) {
        // Ignore error
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

// Configure links to open in new tab
md.use(mdLinkAttributes, {
  attrs: {
    target: '_blank',
    rel: 'noopener',
  },
});

// Enable emoji support
md.use(emoji);

// Export render function
export const renderMarkdown = (content: string): string => {
  if (!content) return '';
  return md.render(content);
};

// Export markdown-it instance
export { md };
