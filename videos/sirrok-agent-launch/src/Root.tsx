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

export const RemotionRoot: React.FC = () => (
  <>
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
