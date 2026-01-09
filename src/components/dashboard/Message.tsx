import React, { Fragment, useState } from "react";
import { Button } from "../ui/button";
import LinkedinReplyMessages from "@/pages/LinkedinReplyMessages";
import EmailReplyMessages from "@/pages/EmailReplyMessages";

const Message = () => {
  const [activeTab, setActiveTab] = useState<"linkedin" | "email">("linkedin");

  return (
    <Fragment>
      <h1 className="text-2xl font-bold mb-4">Messages Section</h1>

      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === "linkedin" ? "default" : "outline"}
          onClick={() => setActiveTab("linkedin")}
        >
          LinkedIn Messages
        </Button>

        <Button
          variant={activeTab === "email" ? "default" : "outline"}
          onClick={() => setActiveTab("email")}
        >
          Email Messages
        </Button>
      </div>

      <div>
        {activeTab === "linkedin" && <LinkedinReplyMessages />}
        {activeTab === "email" && <EmailReplyMessages />}
      </div>
    </Fragment>
  );
};

export default Message;
