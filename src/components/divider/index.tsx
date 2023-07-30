import React from "react";

function Divider(props: { top: number; bottom: number }) {
  return (
    <div
      style={{ marginBottom: props.bottom, marginTop: props.top }}
      className="divider"
    ></div>
  );
}

export default Divider;
