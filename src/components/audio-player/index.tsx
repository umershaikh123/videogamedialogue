import React, { RefObject } from "react";
import "./audioplayer.css";
import { PlayIcon, PauseIcon, ExportIcon } from "../icons";

interface ClipPlayerProps {
  src?: string;
  name: string;
  clip_id?: string;
  user_id?: string;
  download?: boolean;
  onClick?: () => void;
}

interface ClipPlayerState {
  playing: boolean;
  currentTime: number;
  duration: number;
  isDragging: boolean;
  isModalOpen: boolean;
  embedCode?: string;
}

class ClipPlayer extends React.Component<ClipPlayerProps, ClipPlayerState> {
  audioRef: RefObject<HTMLAudioElement>;
  timelineRef: RefObject<HTMLDivElement>;

  constructor(props: ClipPlayerProps) {
    super(props);
    this.audioRef = React.createRef<HTMLAudioElement>();
    this.timelineRef = React.createRef<HTMLDivElement>();
    this.state = {
      playing: false,
      currentTime: 0,
      duration: 0,
      isDragging: false,
      isModalOpen: false,
    };
  }

  componentDidMount() {
    this.audioRef.current?.addEventListener(
      "loadedmetadata",
      this.handleMetadataLoad
    );
    document.addEventListener("mouseup", this.handleDragEnd);
    document.addEventListener("mousemove", this.handleDrag);
  }

  componentWillUnmount() {
    this.audioRef.current?.removeEventListener(
      "loadedmetadata",
      this.handleMetadataLoad
    );
    document.removeEventListener("mouseup", this.handleDragEnd);
    document.removeEventListener("mousemove", this.handleDrag);
  }

  handleMetadataLoad = () => {
    this.setState({ duration: this.audioRef.current?.duration || 0 });
  };

  handlePlayPauseClick = () => {
    if (!this.props.src) return;
    const { playing } = this.state;
    if (playing) {
      this.handlePause();
    } else {
      this.handlePlay();
    }
  };

  handlePlay = () => {
    if (this.props.onClick) {
      this.props.onClick();
    }
    this.audioRef.current?.play();
    this.setState({ playing: true });
  };

  handlePause = () => {
    this.audioRef.current?.pause();
    this.setState({ playing: false });
  };

  handleTimelineUpdate = () => {
    this.setState({
      currentTime: this.audioRef.current?.currentTime || 0,
      duration: this.audioRef.current?.duration || 0,
    });
  };

  handleJumpTenSeconds = () => {
    this.audioRef.current!.currentTime += 10;
  };

  handleJumpBackTenSeconds = () => {
    this.audioRef.current!.currentTime -= 10;
  };

  handleDownload = () => {
    const { src, name } = this.props;
    const link = document.createElement("a");
    if (src) {
      link.href = src;
      link.download = `${name}.mp3`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  handleDragStart = () => {
    this.setState({ isDragging: true });
  };

  handleDragEnd = () => {
    this.setState({ isDragging: false });
  };

  handleDrag = (event: MouseEvent) => {
    const { isDragging } = this.state;
    if (isDragging && this.timelineRef.current) {
      const timelineWidth = this.timelineRef.current.offsetWidth;
      const timelineLeft =
        this.timelineRef.current.getBoundingClientRect().left;
      const offsetX = event.clientX - timelineLeft;
      let newCurrentTime = (offsetX / timelineWidth) * this.state.duration;

      if (newCurrentTime < 0) {
        newCurrentTime = 0;
      } else if (newCurrentTime > this.state.duration) {
        newCurrentTime = this.state.duration;
      }

      this.audioRef.current!.currentTime = newCurrentTime;
      this.setState({ currentTime: newCurrentTime });
    }
  };

  handleTimelineClick = (
    event: React.MouseEvent<HTMLDivElement> | MouseEvent
  ) => {
    const { duration } = this.state;
    const timelineWidth = this.timelineRef.current!.offsetWidth;
    const offsetX =
      event.clientX - this.timelineRef.current!.getBoundingClientRect().left;
    const newCurrentTime = (offsetX / timelineWidth) * duration;
    this.audioRef.current!.currentTime = newCurrentTime;
    this.setState({ currentTime: newCurrentTime });
  };

  formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(1, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  render() {
    const {
      playing,
      currentTime,
      duration,
      isDragging,
      isModalOpen,
      embedCode,
    } = this.state;
    const { src, name } = this.props;
    return (
      <div className="audioplayer-player">
        <audio
          ref={this.audioRef}
          src={src}
          onTimeUpdate={this.handleTimelineUpdate}
        />
        <div className="audioplayer-player_content">
          <div
            className="audioplayer-player_icon"
            style={{ cursor: "pointer" }}
            onClick={this.handlePlayPauseClick}
          >
            {playing ? (
              <PauseIcon width={18} height={18} />
            ) : (
              <PlayIcon width={14} height={18} />
            )}
          </div>
          <div className="audioplayer-player_bottom">
            <h3
              className="heading-small color-grey-700"
              style={{ fontWeight: 600 }}
            >
              {name}
            </h3>
            <div className="audioplayer-player_timeline-controls">
              <div
                className="audioplayer-player_timeline"
                onMouseDown={this.handleDragStart}
                onClick={this.handleTimelineClick}
                ref={this.timelineRef}
              >
                <div
                  className="audioplayer-player_timeline-current"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
                <div
                  className="audioplayer-player_timeline-handle"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>
              <div className="audioplayer-player_timeline-timestamp">
                <span className="color-grey-700">
                  {this.formatTime(currentTime)}
                </span>
                <span className="color-grey-700"> / </span>
                <span className="color-grey-700">
                  {this.formatTime(duration)}
                </span>
              </div>
              {src && this.props.download && (
                <div
                  className="audioplayer-player_download-file"
                  onClick={this.handleDownload}
                >
                  <ExportIcon width={20} height={20} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ClipPlayer;
