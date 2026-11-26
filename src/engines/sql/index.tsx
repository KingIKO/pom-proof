import type { Problem } from '../../lib/contracts';
import StubWorkspace from '../StubWorkspace';
import { grade } from './grade';

export default function Sql({ problem }: { problem: Problem<'sql'> }) {
  return <StubWorkspace<'sql'> problem={problem} engine="sql" grade={grade} />;
}
