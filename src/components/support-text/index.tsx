import React from "react";

function SupportText(props: { name: string; description?: string }) {
  return (
    <div className="support-text">
      <h3 className="text-small" style={{ fontWeight: 500 }}>
        {props.name}
      </h3>
      {props.description && <p className="text-small">{props.description}</p>}
    </div>
  );
}

export default SupportText;
