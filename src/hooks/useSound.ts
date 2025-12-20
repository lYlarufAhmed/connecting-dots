// useSound.ts

import { useAudioPlayer } from 'expo-audio'
// import { useEffect, useRef, useState } from 'react'


export const useSound = (soundFile: any) => {
    const player = useAudioPlayer(soundFile)

    return {
        player
    }
}

