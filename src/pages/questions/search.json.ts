import { getCollection } from 'astro:content';
import { htmlToHast, type HastNode } from 'satteri';
import { questionTopics } from '../../components/questions/questions';

function prose(node: HastNode): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element' && ['pre', 'br', 'script', 'style', 'template'].includes(node.tagName)) return ' ';
  return 'children' in node ? node.children.map(prose).join('') : '';
}

export async function GET() {
  const entries = await getCollection('questions');
  const index = Object.fromEntries(entries.map(({ id, data, rendered }) => {
    if (!rendered) throw new Error(`Question ${id} has no rendered Markdown to index.`);
    const { title, topic, oneLine, looksFor, trap, followUps } = data;
    const text = [
      title, questionTopics[topic], oneLine, ...looksFor, trap,
      ...followUps.flatMap(({ question, answer }) => [question, answer]),
      prose(htmlToHast(rendered.html, { fragment: true })),
    ].join(' ').replace(/\s+/g, ' ').trim().toLowerCase();
    return [id, text];
  }));
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json' } });
}
