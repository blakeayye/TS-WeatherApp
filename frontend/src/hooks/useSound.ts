import { useSound as _useSound } from 'use-sound';

import negativeAudio from '../assets/sounds/negative.mp3';
import positiveAudio from '../assets/sounds/positive.mp3';
import beepAudio from '../assets/sounds/beep.mp3';
import confirmAudio from '../assets/sounds/confirm.mp3';
import backAudio from '../assets/sounds/back.mp3';
import tickAudio from '../assets/sounds/ticking.ogg';
import clickAudio from '../assets/sounds/shiftyclick.ogg';
import clickAudio2 from '../assets/sounds/click3.wav';

type SoundEffect = 'click2' | 'click1' | 'negative' | 'positive' | 'confirm' | 'back' | 'tick' | 'stop' | 'default';

/**
* Handles front end sounds from imported
*
* @param {string} - what string the function for each audio is
*/
const useSoundEffects = () => {
    const [negative, { stop: stopNegative }] = _useSound(negativeAudio, {
        volume: 0.25,
    });
    const [click1, { stop: stopClick }] = _useSound(clickAudio, {
        volume: 0.25,
    });
    const [click2, { stop: stopClick2 }] = _useSound(clickAudio2, {
        volume: 0.45,
    });
    const [positive, { stop: stopPositive }] = _useSound(positiveAudio, {
        volume: 0.15,
    });
    const [beep, { stop: stopBeep }] = _useSound(beepAudio, { volume: 0.25 });
    const [confirm, { stop: stopConfirm }] = _useSound(confirmAudio, {
        volume: 0.25,
    });
    const [back, { stop: stopBack }] = _useSound(backAudio, { volume: 0.25 });
    const [tick, { stop: stopTick }] = _useSound(tickAudio, {
        volume: 0.25,
        loop: true,
    });

    return (effect: SoundEffect) => {
        switch (effect) {
            case 'click1':
                click1();  
                break;    
            case 'click2':
                click2();  
                break;    
            case 'negative':
                negative();
                break;
            case 'positive':
                positive();
                break;
            case 'confirm':
                confirm();
                break;
            case 'back':
                back();
                break;
            case 'tick':
                tick();
                break;
            case 'stop':
                stopNegative();
                stopPositive();
                stopBeep();
                stopConfirm();
                stopBack();
                stopTick();
                stopClick();
                stopClick2();
                break;
            default:
                beep();
                break;
        }
    };
};

export default useSoundEffects;
