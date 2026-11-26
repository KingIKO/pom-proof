import type { Problem, StructuredKind } from '../../lib/contracts';
import StubWorkspace from '../StubWorkspace';
import { grade } from './grade';

export default function Structured({ problem }: { problem: Problem<StructuredKind> }) {
  return <StubWorkspace<StructuredKind> problem={problem} engine="structured" grade={grade} />;
}
