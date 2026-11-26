import type { Problem } from '../../lib/contracts';
import StubWorkspace from '../StubWorkspace';
import { grade } from './grade';

export default function Code({ problem }: { problem: Problem<'code'> }) {
  return <StubWorkspace<'code'> problem={problem} engine="code" grade={grade} />;
}
