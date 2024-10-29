import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import * as FileSystem from 'expo-file-system';

const RecordingsScreen = () => {
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const directoryUri = FileSystem.cacheDirectory + 'yourSubdirectoryForRecordings/';
        const files = await FileSystem.readDirectoryAsync(directoryUri);
        setRecordings(files);
      } catch (error) {
        console.error('Error fetching recordings:', error);
      }
    };

    fetchRecordings();
  }, []);

  return (
    <View>
      <FlatList
        data={recordings}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
    </View>
  );
};

export default RecordingsScreen;
