import './fonts';
import React from 'react';
import {Composition, Folder} from 'remotion';
import {S1Wake} from './scenes/S1Wake';
import {S2Work} from './scenes/S2Work';
import {S3Phone} from './scenes/S3Phone';
import {S4Everywhere} from './scenes/S4Everywhere';
import {S5Reveal} from './scenes/S5Reveal';
import {SirrokLaunch} from './SirrokLaunch';
import {FPS, H, T, TOTAL, W} from './theme';
import {F, TOTAL as FILM_TOTAL} from './film/timeline';
import {SirrokFilm} from './film/SirrokFilm';
import {GhostFXShowcase, GHOSTFX_DURATION} from './film/ghostfx';
import {Intro} from './film/scenes/Intro';
import {Call} from './film/scenes/Call';
import {Island} from './film/scenes/Island';
import {Social} from './film/scenes/Social';
import {Connect} from './film/scenes/Connect';
import {Meet} from './film/scenes/Meet';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SirrokFilm" component={SirrokFilm} width={W} height={H} fps={FPS} durationInFrames={FILM_TOTAL} />
    <Composition id="GhostFX" component={GhostFXShowcase} width={W} height={H} fps={FPS} durationInFrames={GHOSTFX_DURATION} />
    <Folder name="Film-Scenes">
      <Composition id="F-Intro" component={Intro} width={W} height={H} fps={FPS} durationInFrames={F.intro} />
      <Composition id="F-Call" component={Call} width={W} height={H} fps={FPS} durationInFrames={F.call} />
      <Composition id="F-Island" component={Island} width={W} height={H} fps={FPS} durationInFrames={F.island} />
      <Composition id="F-Social" component={Social} width={W} height={H} fps={FPS} durationInFrames={F.social} />
      <Composition id="F-Connect" component={Connect} width={W} height={H} fps={FPS} durationInFrames={F.connect} />
      <Composition id="F-Meet" component={Meet} width={W} height={H} fps={FPS} durationInFrames={F.meet} />
    </Folder>
    <Composition id="SirrokLaunch" component={SirrokLaunch} width={W} height={H} fps={FPS} durationInFrames={TOTAL} />
    <Folder name="Scenes">
      <Composition id="S1-Wake" component={S1Wake} width={W} height={H} fps={FPS} durationInFrames={T.wake} />
      <Composition id="S2-Work" component={S2Work} width={W} height={H} fps={FPS} durationInFrames={T.work} />
      <Composition id="S3-Phone" component={S3Phone} width={W} height={H} fps={FPS} durationInFrames={T.phone} />
      <Composition id="S4-Everywhere" component={S4Everywhere} width={W} height={H} fps={FPS} durationInFrames={T.everywhere} />
      <Composition id="S5-Reveal" component={S5Reveal} width={W} height={H} fps={FPS} durationInFrames={T.reveal} />
    </Folder>
  </>
);
