import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import CaseStudyPage from "../pages/CaseStudyPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/case/:caseId",
    element: <CaseStudyPage />
  }
]);
