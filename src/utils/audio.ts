// Background music controller using YouTube Iframe Player API
// Track: "Pixie Dust & Fairy Tales | Magical Fantasy Music" (CdOn2NoAw8M) by Marc Jungermann
// URL: https://youtu.be/CdOn2NoAw8M
// Volume: strictly set to 10% ("lievissima al 10%") with gentle fade-in and loop

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

class BackgroundMusicPlayer {
  private player: any = null;
  private isReady = false;
  private isPlaying = false;
  private userMuted = false;
  private readonly targetVolume = 10; // Strictly 10% as requested by user
  private currentVolume = 0;
  private fadeInterval: number | null = null;
  private listeners: Set<(playing: boolean, volume: number) => void> = new Set();
  private pendingPlay = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initYouTubePlayer();
      this.setupAutoPlayGesture();
    }
  }

  private initYouTubePlayer() {
    if (document.getElementById('yt-bg-music-player-container')) return;

    // Create a discreet, off-screen container that remains active in the DOM
    const container = document.createElement('div');
    container.id = 'yt-bg-music-player-container';
    container.setAttribute('aria-hidden', 'true');
    container.style.cssText =
      'position:fixed;bottom:0;right:0;width:12px;height:12px;opacity:0.001;pointer-events:none;z-index:-9999;overflow:hidden;';

    const playerDiv = document.createElement('div');
    playerDiv.id = 'yt-bg-music-player';
    container.appendChild(playerDiv);
    document.body.appendChild(container);

    const onAPIReady = () => {
      try {
        this.player = new window.YT.Player('yt-bg-music-player', {
          videoId: 'CdOn2NoAw8M',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: 'CdOn2NoAw8M',
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            iv_load_policy: 3,
            enablejsapi: 1,
          },
          events: {
            onReady: (event: any) => {
              this.isReady = true;
              try {
                event.target.setVolume(this.targetVolume);
              } catch {
                // Ignore
              }
              if (this.pendingPlay && !this.userMuted) {
                this.play();
              }
            },
            onStateChange: (event: any) => {
              // 0 = Ended -> loop seamlessly back to start
              if (event.data === (window.YT?.PlayerState?.ENDED ?? 0)) {
                try {
                  event.target.seekTo(0);
                  event.target.playVideo();
                } catch {
                  // Ignore
                }
              } else if (event.data === (window.YT?.PlayerState?.PLAYING ?? 1)) {
                this.isPlaying = true;
                this.notify();
              } else if (
                event.data === (window.YT?.PlayerState?.PAUSED ?? 2) ||
                event.data === (window.YT?.PlayerState?.CUED ?? 5)
              ) {
                if (this.currentVolume === 0) {
                  this.isPlaying = false;
                  this.notify();
                }
              }
            },
            onError: (err: any) => {
              console.warn('Background music player warning:', err);
            },
          },
        });
      } catch (e) {
        console.warn('Failed to initialize YouTube music player:', e);
      }
    };

    if (window.YT && window.YT.Player) {
      onAPIReady();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === 'function') prevCallback();
        onAPIReady();
      };

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
      }
    }
  }

  // First interaction gesture trigger (pointerdown or keydown)
  private setupAutoPlayGesture() {
    const handleFirstGesture = () => {
      if (!this.userMuted && !this.isPlaying) {
        this.play();
      }
      document.removeEventListener('pointerdown', handleFirstGesture);
      document.removeEventListener('keydown', handleFirstGesture);
    };

    document.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    document.addEventListener('keydown', handleFirstGesture, { passive: true });
  }

  public subscribe(cb: (playing: boolean, volume: number) => void): () => void {
    this.listeners.add(cb);
    cb(this.isPlaying, this.targetVolume);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isPlaying, this.targetVolume));
  }

  public play() {
    this.userMuted = false;
    if (!this.isReady || !this.player) {
      this.pendingPlay = true;
      return;
    }

    this.pendingPlay = false;
    this.clearFade();

    try {
      this.player.setVolume(0);
      this.currentVolume = 0;
      this.player.playVideo();
      this.isPlaying = true;
      this.notify();

      // Gentle fade-in up to strictly 10%
      const steps = 10;
      const stepTime = 180;
      let step = 0;

      this.fadeInterval = window.setInterval(() => {
        step++;
        const vol = Math.min(this.targetVolume, Math.round((step / steps) * this.targetVolume));
        this.currentVolume = vol;
        try {
          this.player.setVolume(vol);
        } catch {
          // Ignore
        }

        if (step >= steps || vol >= this.targetVolume) {
          this.clearFade();
          this.currentVolume = this.targetVolume;
          try {
            this.player.setVolume(this.targetVolume);
          } catch {
            // Ignore
          }
        }
      }, stepTime);
    } catch {
      this.isPlaying = false;
      this.notify();
    }
  }

  public stop() {
    this.userMuted = true;
    this.pendingPlay = false;

    if (!this.isReady || !this.player) {
      this.isPlaying = false;
      this.notify();
      return;
    }

    this.clearFade();
    const initialVol = this.currentVolume;
    const steps = 8;
    const stepTime = 120;
    let step = 0;

    this.fadeInterval = window.setInterval(() => {
      step++;
      const vol = Math.max(0, Math.round(initialVol - (step / steps) * initialVol));
      this.currentVolume = vol;
      try {
        this.player.setVolume(vol);
      } catch {
        // Ignore
      }

      if (step >= steps || vol <= 0) {
        this.clearFade();
        this.currentVolume = 0;
        try {
          this.player.pauseVideo();
        } catch {
          // Ignore
        }
        this.isPlaying = false;
        this.notify();
      }
    }, stepTime);
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.targetVolume;
  }

  private clearFade() {
    if (this.fadeInterval !== null) {
      window.clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }
}

export const musicBox = new BackgroundMusicPlayer();
export const backgroundMusic = musicBox;
