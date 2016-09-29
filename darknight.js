import { note } from 'studio';
import { envelope as env } from 'studio';
import { Saw, Tri, Sqr } from 'studio';
import { Chord, Chords } from 'studio';
import { Biquad } from 'studio';
import Bassline from './lib/bassline';

export let bpm = 125;

export let kick = [1, function kick(t) {
  return arp(t, 1/4, 50, 30, 8) * .6;
}];

var chip_osc = Tri(10, false);

export let chip = [32, function chip(t) {
  t/=6;
  var c = progr[(progr.length-1)-(t%progr.length|0)];
  return arp(t+2/8, 1/14, arp(t, 1/16, chip_osc(note(c[t*5%3|0])*2*4*(t*6%4|0)), 50, 10) * .4, 10, 5);
  return arp(t+2/8, 1/28, arp(t, 1/16, chip_osc(note(c[t*5%3|0])*2*4*(t*6%4|0)), 50, 10) * .8, 100, 50);
}];

var vcf = new Biquad('lpf');

vcf
  .cut(700)
  .res(28)
  .gain(4)
  .update();

var base = oct(4);
var chord = Chord(Saw, 36);
var progr = ['Cmin6', 'Dmin','E#min'].map(Chords);

export let pad = [8, function pad(t) {
  t/=4
  var c = progr[(progr.length-1)-(t%progr.length|0)];
  var vol = env(t, 1/4, 2, 4) * env(t+3/8, 1/4, 3, 1);
  var out = vol * chord(c.map(note).map(base), .2);

  vcf.cut(800 + 600 * Math.sin(.125 * t * Math.PI * 2));
  out = vcf.update().run(out);

  return out * .25;
}];

var bassline = Bassline();

var bassline_notes = [
  progr[0][0],
  progr[1][0],
  progr[2][0],
  progr[1][1],
].map(oct(4)).map(note);

var hpf = [.0032, .0052, .0072, .0012];

bassline
  .seq(bassline_notes)
  .hpf(.0032)
  .pre(.5)
  .clip(35)
  .res(.32)
  .lfo(4)
  .lfo2(.5);

export let bass = [16, function bass(t) {
  return bassline.hpf(hpf[(hpf.length-1)-(t/4%hpf.length|0)]).cut(.82).play(t/4) * .13;
}];

var mul = 10e5;

function step(t, sig) {
  t = t * mul | 0;
  sig = sig * mul | 0;
  if (t % sig === 0) return t;
}

function oct(x) {
  return function(y) {
    return x * y;
  };
}

function arp(t, measure, x, y, z) {
  var ts = t / 4 % measure;
  return Math.sin(x * (Math.exp(-ts * y))) * Math.exp(-ts * z);
}
