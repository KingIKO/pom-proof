import type { Problem } from '../../lib/contracts';
import StubWorkspace from '../StubWorkspace';
import { grade } from './grade';

export default function Mutation({ problem }: { problem: Problem<'test-design'> }) {
  return <StubWorkspace<'test-design'> problem={problem} engine="mutation" grade={grade} />;
}
