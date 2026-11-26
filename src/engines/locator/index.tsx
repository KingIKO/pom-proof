import type { Problem } from '../../lib/contracts';
import StubWorkspace from '../StubWorkspace';
import { grade } from './grade';

export default function Locator({ problem }: { problem: Problem<'locator'> }) {
  return <StubWorkspace<'locator'> problem={problem} engine="locator" grade={grade} />;
}
