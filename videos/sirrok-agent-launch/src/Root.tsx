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
import {Pick} from './film/scenes/Pick';
import {Team} from './film/scenes/Team';
import {Sleep} from './film/scenes/Sleep';
import {MascotShowcase, MASCOT_SHOWCASE} from './film/mascot';
import {SirrokFilmVertical} from './film/vertical/SirrokFilmVertical';
import {VW, VH} from './film/vertical/frame';
import {VIntro} from './film/vertical/VIntro';
import {VWake} from './film/vertical/VWake';
import {VWork} from './film/vertical/VWork';
import {VCall} from './film/vertical/VCall';
import {VIsland} from './film/vertical/VIsland';
import {VSocial} from './film/vertical/VSocial';
import {VConnect} from './film/vertical/VConnect';
import {VEverywhere} from './film/vertical/VEverywhere';
import {VReveal} from './film/vertical/VReveal';
import {VMeet} from './film/vertical/VMeet';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SirrokFilm" component={SirrokFilm} width={W} height={H} fps={FPS} durationInFrames={FILM_TOTAL} />
    <Composition id="SirrokFilmVertical" component={SirrokFilmVertical} width={VW} height={VH} fps={FPS} durationInFrames={FILM_TOTAL} />
    <Folder name="Vertical-Scenes">
      <Composition id="V-Pick" component={Pick} width={VW} height={VH} fps={FPS} durationInFrames={F.pick} />
      <Composition id="V-Team" component={Team} width={VW} height={VH} fps={FPS} durationInFrames={F.team} />
      <Composition id="V-Sleep" component={Sleep} width={VW} height={VH} fps={FPS} durationInFrames={F.sleep} />
      <Composition id="V-Intro" component={VIntro} width={VW} height={VH} fps={FPS} durationInFrames={F.intro} />
      <Composition id="V-Wake" component={VWake} width={VW} height={VH} fps={FPS} durationInFrames={F.wake} />
      <Composition id="V-Work" component={VWork} width={VW} height={VH} fps={FPS} durationInFrames={F.work} />
      <Composition id="V-Call" component={VCall} width={VW} height={VH} fps={FPS} durationInFrames={F.call} />
      <Composition id="V-Island" component={VIsland} width={VW} height={VH} fps={FPS} durationInFrames={F.island} />
      <Composition id="V-Social" component={VSocial} width={VW} height={VH} fps={FPS} durationInFrames={F.social} />
      <Composition id="V-Connect" component={VConnect} width={VW} height={VH} fps={FPS} durationInFrames={F.connect} />
      <Composition id="V-Everywhere" component={VEverywhere} width={VW} height={VH} fps={FPS} durationInFrames={F.everywhere} />
      <Composition id="V-Reveal" component={VReveal} width={VW} height={VH} fps={FPS} durationInFrames={F.reveal} />
      <Composition id="V-Meet" component={VMeet} width={VW} height={VH} fps={FPS} durationInFrames={F.meet} />
    </Folder>
    <Composition id="Mascot" component={MascotShowcase} width={W} height={H} fps={FPS} durationInFrames={MASCOT_SHOWCASE} />
    <Composition id="GhostFX" component={GhostFXShowcase} width={W} height={H} fps={FPS} durationInFrames={GHOSTFX_DURATION} />
    <Folder name="Film-Scenes">
      <Composition id="F-Intro" component={Intro} width={W} height={H} fps={FPS} durationInFrames={F.intro} />
      <Composition id="F-Call" component={Call} width={W} height={H} fps={FPS} durationInFrames={F.call} />
      <Composition id="F-Island" component={Island} width={W} height={H} fps={FPS} durationInFrames={F.island} />
      <Composition id="F-Social" component={Social} width={W} height={H} fps={FPS} durationInFrames={F.social} />
      <Composition id="F-Connect" component={Connect} width={W} height={H} fps={FPS} durationInFrames={F.connect} />
      <Composition id="F-Pick" component={Pick} width={W} height={H} fps={FPS} durationInFrames={F.pick} />
      <Composition id="F-Team" component={Team} width={W} height={H} fps={FPS} durationInFrames={F.team} />
      <Composition id="F-Sleep" component={Sleep} width={W} height={H} fps={FPS} durationInFrames={F.sleep} />
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
