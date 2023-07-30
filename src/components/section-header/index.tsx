import React from "react";

function SectionHeader(props: { title: string; helpText?: string }) {
  return (
    <div className="section-header">
      <div className="title-and-text">
        <h2 className="heading-small">{props.title}</h2>
        {props.helpText && <p className="text-small">{props.helpText}</p>}
      </div>
    </div>
  );
}

export default SectionHeader;
