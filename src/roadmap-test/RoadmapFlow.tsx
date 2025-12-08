import Mindmap from "./Mindmap";
import roadmap from "./reactRoadmap.json";

export default function App() {
  return <Mindmap data={roadmap} width={1200} height={800} />;
}
