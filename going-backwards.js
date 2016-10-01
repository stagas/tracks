import { note } from 'studio';
import { envelope as env } from 'studio';
import { Sin, Saw, Tri, Sqr, Ramp } from 'studio';
import { Chord, Chords } from 'studio';
import { Biquad } from 'studio';
import { MoogLadder } from 'studio';

export let bpm = 125;

export let kick = [1, function kick(t) {
  return arp(t, 1/4, 50, 30, 8) * .6;
}];

var chip_osc = Saw(10, true);

export let chip = [32, function chip(t) {
  t/=6;
  var c = progr[(t%progr.length|0)];
  return arp(t+2/8, 1/4, arp(t+2/24, 1/24, chip_osc(note(c[t*5%3|0])*4*(t*6%3|0)), 50, 4) * .8, 5, 5) * 2;
}];

var vcf = new Biquad('lpf');

vcf
  .cut(1600)
  .res(22)
  .gain(5)
  .update();

var base = oct(6);
var chord = Chord(Ramp, 10);
var progr = ['A#min', 'Cmin'].map(Chords);

export let pad = [16, function pad(t) {
  t/=4
  var c = progr[(t%progr.length|0)];
  var vol = env(t, 1/4, 2, 4) * env(t+3/8, 1/4, 3, 1);
  var out = vol * chord(c.map(note).map(base), .2);

  vcf.cut(600 + 100 * Math.sin(4 * (t+1/4) * Math.PI * 2));
  out = vcf.update().run(out);

  return out * .5;
}];

var moog_lpf = MoogLadder('half');
var moog_osc = Saw();
var moog_lfo = Sin();

export let moog = [8, function moog(t){
  t/=2

  var c = progr[(t%progr.length|0)];
  var out = moog_osc(note(c[t*4%3|0])*2);

  moog_lpf
    .cut(1000 + (950 * moog_lfo(0.5)))
    .res(0.87)
    .sat(2.15)
    .update();

  out = moog_lpf.run(out);

  return out * .35;
}];

function oct(x) {
  return function(y) {
    return x * y;
  };
}

function arp(t, measure, x, y, z) {
  var ts = t / 4 % measure;
  return Math.sin(x * (Math.exp(-ts * y))) * Math.exp(-ts * z);
}
