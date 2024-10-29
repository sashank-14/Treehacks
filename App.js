import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import {
  /* Inside expo-av/src/Audio.types.ts: */
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from "expo-av";

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const audioStatus = await Audio.requestPermissionsAsync();
      setHasAudioPermission(audioStatus.status === 'granted');
    })();
  }, []);

  if (hasCameraPermission === null || hasAudioPermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false || hasAudioPermission === false) {
    return <Text>No access to camera or microphone</Text>;
  }

  async function startRecording() {
    try {
      // Correctly set the audio mode for iOS recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        InterruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS, // Correct value
        playsInSilentModeIOS: true,
        InterruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
  
      // Proceed with starting the recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  }
  
  

  async function stopRecording() {
    if (!recording) {
      return;
    }
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log("Recording stopped and stored at", uri);
    setRecording(null); // Reset recording state
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} />
      <Button
        title="Flip Camera"
        onPress={() => {
          setType(
            type === Camera.Constants.Type.back
              ? Camera.Constants.Type.front
              : Camera.Constants.Type.back
          );
        }}
      />
      <Button title="Start Recording" onPress={startRecording} disabled={recording !== null} />
      <Button title="Stop Recording" onPress={stopRecording} disabled={recording === null} />
      <Button title="List Recordings" onPress={listRecordings} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    aspectRatio: 1,
    width: '100%',
  },
});


import * as FileSystem from 'expo-file-system';

const listRecordings = async () => {
  try {
    // Specify the directory containing the recordings
    const directoryUri = FileSystem.cacheDirectory + '/';

    // Get the contents of the directory
    const { files } = await FileSystem.readDirectoryAsync(directoryUri);

    // Log the paths of files in the directory
    console.log('Recordings:', files);
  } catch (error) {
    console.error('Error listing recordings:', error);
  }
};
