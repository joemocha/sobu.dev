import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeSlug from 'rehype-slug';
import { visit } from 'unist-util-visit';

// Adds data-pid="p1", "p2", ... to every <p> element so the article scripts
// can highlight the centermost paragraph and anchor margin notes to it.
function rehypeParagraphIds() {
  return (tree) => {
    let n = 0;
    visit(tree, 'element', (node) => {
      if (node.tagName === 'p') {
        n += 1;
        node.properties = node.properties || {};
        node.properties['data-pid'] = `p${n}`;
      }
    });
  };
}

// File-format build so URLs stay verbatim with the previous static site:
//   src/pages/article.astro          -> /article.html
//   src/pages/articles/[slug].astro  -> /articles/<slug>.html
export default defineConfig({
  site: 'https://sobu.dev',
  integrations: [mdx()],
  markdown: {
    rehypePlugins: [rehypeSlug, rehypeParagraphIds],
  },
  build: {
    format: 'file',
  },
  trailingSlash: 'never',
});
