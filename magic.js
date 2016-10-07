import { note } from 'studio';
import { Tri, Saw } from 'studio';
import { envelope } from 'studio';
import { Sampler } from 'studio';
import { Step } from 'studio';
import Bassline from './lib/bassline';

import kick from './drumkit/BTAA0D3.WAV';
import clap from './drumkit/HANDCLP1.WAV';
import snare from './drumkit/ST0T0S7.WAV';
import ohat from './drumkit/HHOD4.WAV';

var drums = Sampler(12);
drums.tune(1);
drums.add('kick', kick);
drums.add('clap', clap);
drums.add('snare', snare);
drums.add('ohat', ohat);

export let bpm = 125;

var step = Step(bpm);

var step_kick = step(1/4);
var step_kick_2 = step(2, 1/4+2/16);
var step_ohat = step(1/4, 1/8);
var step_ohat_2 = step(1, 1/4+2/16);
var step_snare = step(1/2, 1/4);
var step_clap = step(1, 1/4+1/8);
var step_clap_2 = step(4, 2/4+4/16);

export let drumbeat = [16, function drumbeat(t, f){
  if (step_kick(f)) drums.play('kick', .35, 1.09);
  if (step_kick_2(f)) drums.play('kick', .15, 1.09, true);
  if (step_ohat(f)) drums.play('ohat', .09, 2.1);
  if (step_ohat_2(f)) drums.play('ohat', .09, 2.7, true);
  if (step_snare(f)) drums.play('snare', .15, 1.25);
  if (step_clap(f)) drums.play('clap', .15, 2.9, true);
  if (step_clap_2(f)) drums.play('clap', .50, 2);
  return drums.mix() * .47;
}];

export let kick2 = [1, function kick2(t) {
  return arp(t, 1/4, 45, 15, 5) * .5;
}];

function arp(t, measure, x, y, z) {
  var ts = t / 4 % measure;
  return Math.sin(x * (Math.exp(-ts * y))) * Math.exp(-ts * z);
}

var bassline = Bassline();

var bassline_notes = [
  'd1','f2','e#0','g1',
  'd1','f2','e#1','g2',
].map(note);

var hpf = [.0012, .0072, .0025];
var cut = [.32,.95,.48];
bassline
  .seq(bassline_notes)
  .hpf(.0032)
  .pre(.6)
  .clip(40)
  .res(.7)
  .lfo(1.5)
  .lfo2(2);

export let bass = [16, function bass(t) {
  return bassline
    .hpf(hpf[t%hpf.length|0])
    .cut(cut[t%cut.length|0])
    .play(t/4) * .07;
}];

var chip_osc = Tri(10, false);

export let chip = [8, function chip(t) {
  var c = bassline_notes[t%bassline_notes.length|0]*8;
  // return arp(t+2/8, 1/14, arp(t, 1/16, chip_osc(c)*(t*6%4|0), 50, 10) * .4, 100, 5);
  return .7 * arp(t+2/8, 1/28, arp(t, 1/16, chip_osc(c)*(t*4%((t/2%2|0)+2)|0), 50, 10) * .8, 100, 20) * envelope(t+2/4, 1/4, 5, 10);
}];

function oct(x) {
  return function(y) {
    return x * y;
  };
}
