import React from 'react';
import {FilmBody, SceneMap} from '../SirrokFilm';
import {VIntro} from './VIntro';
import {VWake} from './VWake';
import {VWork} from './VWork';
import {VCall} from './VCall';
import {VIsland} from './VIsland';
import {VSocial} from './VSocial';
import {VConnect} from './VConnect';
import {VEverywhere} from './VEverywhere';
import {VReveal} from './VReveal';
import {VMeet} from './VMeet';

/** Bản dọc 9:16 — cùng thoại, nhạc, SFX và mốc thời gian với bản ngang; chỉ bố cục khác. */
const VSCENES: SceneMap = {
  intro: VIntro,
  wake: VWake,
  work: VWork,
  call: VCall,
  island: VIsland,
  social: VSocial,
  connect: VConnect,
  everywhere: VEverywhere,
  reveal: VReveal,
  meet: VMeet,
};

export const SirrokFilmVertical: React.FC = () => <FilmBody scenes={VSCENES} />;
