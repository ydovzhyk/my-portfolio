'use client'

import { useState, useCallback, useRef } from 'react'

const useAudioRecorder = ({ dataCb }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState()
  const [timerInterval, setTimerInterval] = useState()
  const sourceNode = useRef()
  const scriptProcessor = useRef()
  const audioContext = useRef(null)
  const audioChunksRef = useRef([])

  const _startTimer = useCallback(() => {
    const interval = setInterval(() => {
      setRecordingTime((time) => time + 1)
    }, 1000)
    setTimerInterval(interval)
  }, [setRecordingTime, setTimerInterval])

  const _stopTimer = useCallback(() => {
    timerInterval != null && clearInterval(timerInterval)
    setTimerInterval(undefined)
  }, [timerInterval, setTimerInterval])

  const float32To16BitPCM = (float32Arr) => {
    const pcm16bit = new Int16Array(float32Arr.length)
    for (let i = 0; i < float32Arr.length; ++i) {
      const s = Math.max(-1, Math.min(1, float32Arr[i]))
      pcm16bit[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
    return pcm16bit
  }

  const startRecording = async () => {
    if (timerInterval != null) throw new Error('timerInterval not null')
    const isTesting = !navigator.mediaDevices
    if (isTesting) {
      setIsRecording(true)
      return 24000
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext ||
        window.webkitAudioContext)()
    }
    audioContext.current.resume()
    sourceNode.current = audioContext.current.createMediaStreamSource(stream)

    const chunkSize = 4096
    scriptProcessor.current = audioContext.current.createScriptProcessor(
      chunkSize,
      1,
      1
    )

    scriptProcessor.current.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer
      const float32Audio = inputBuffer.getChannelData(0)
      const pcm16Audio = float32To16BitPCM(float32Audio)
      if (dataCb) {
        dataCb(pcm16Audio, audioContext.current.sampleRate)
      }
    }

    sourceNode.current.connect(scriptProcessor.current)
    scriptProcessor.current.connect(audioContext.current.destination)

    const recorder = new MediaRecorder(stream)
    setMediaRecorder(recorder)

    audioChunksRef.current = []
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data)
      }
    }

    recorder.start()
    setIsRecording(true)
    _startTimer()
    return audioContext.current.sampleRate
  }

  const stopRecording = async () => {
    return new Promise((resolve) => {
      if (!mediaRecorder) return resolve(null)

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        })
        audioChunksRef.current = []
        scriptProcessor.current?.disconnect()
        sourceNode.current?.disconnect()
        setRecordingTime(0)
        setIsRecording(false)
        setIsPaused(false)
        resolve(audioBlob)
      }

      mediaRecorder.stop()
      _stopTimer()
    })
  }

  const togglePauseResume = useCallback(() => {
    if (isPaused) {
      setIsPaused(false)
      mediaRecorder?.resume()
      _startTimer()
    } else {
      setIsPaused(true)
      _stopTimer()
      mediaRecorder?.pause()
    }
  }, [mediaRecorder, setIsPaused, _startTimer, _stopTimer])

  return {
    startRecording,
    stopRecording,
    togglePauseResume,
    isRecording,
    audioContext: audioContext.current,
    sourceNode: sourceNode.current,
  }
}
export default useAudioRecorder
