console.log(
`%c ███████╗ ██╗ ██╗   ██╗ 
%c ██╔════╝ ██║ ██║   ██║
%c ███████╗ ██║ ████████║
%c ╚════██║ ██║ ██║   ██║
%c ███████║ ██║ ██║   ██║
%c ╚══════╝ ╚═╝ ╚═╝   ╚═╝

%c██╗    ██╗██╗███╗   ██╗███╗   ██╗███████╗██████╗ 
%c██║    ██║██║████╗  ██║████╗  ██║██╔════╝██╔══██╗
%c██║ █╗ ██║██║██╔██╗ ██║██╔██╗ ██║█████╗  ██████╔╝
%c██║███╗██║██║██║╚██╗██║██║╚██╗██║██╔══╝  ██╔══██╗
%c╚███╔███╔╝██║██║ ╚████║██║ ╚████║███████╗██║  ██║
%c ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
`,
  // SIH colors (S I H)
  "color: yellow; font-weight: bold;",
  "color: yellow; font-weight: bold;",
  "color: yellow; font-weight: bold;",
  "color: yellow; font-weight: bold;",
  "color: yellow; font-weight: bold;",
  "color: yellow; font-weight: bold;",

  // WINNER colors (yellow)
  "color: white; font-weight: bold;",
  "color: white; font-weight: bold;",
  "color: white; font-weight: bold;",
  "color: white; font-weight: bold;",
  "color: white; font-weight: bold;",
  "color: white; font-weight: bold;",
);


import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
