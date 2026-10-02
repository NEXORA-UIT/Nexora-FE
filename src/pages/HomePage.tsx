import * as React from "react";
import {
  HomeGreeting,
  MyWorkSection,
  AiInsightCard,
  UpcomingSection,
  ContinueWorkingSection,
} from "@/components/dashboard";

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Header: Greeting, Scope Metadata & Today Badge */}
      <HomeGreeting />

      {/* 2. Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column (8 cols): My Work Task List */}
        <div className="lg:col-span-8">
          <MyWorkSection />
        </div>

        {/* Right Column (4 cols): Upcoming Tasks & Supporting AI Insight */}
        <div className="space-y-6 lg:col-span-4">
          <UpcomingSection />
          <AiInsightCard />
        </div>
      </div>

      {/* 3. Bottom Section: Continue Working Recent Boards */}
      <ContinueWorkingSection />
    </div>
  );
};
