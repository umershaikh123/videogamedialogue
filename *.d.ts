declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
  export default ReactComponent;
}

declare interface Character {
  character_id: string;
  name: string;
  description?: string;
  user_id: string;
  image_url?: string;
  elevenlabs_id?: string;
}

declare interface Clip {
  clip_id: string;
  character_id: string;
  user_id: string;
  clip_url?: string;
  name: string;
  text?: string;
  created_at?: string;
}
