import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";
import { API_KEY } from "../secrets.js";
import { connect } from "react-redux";
import {setTranslation} from '../store/text'
import TranslatedText from './translatedText' 

const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

async function callGoogleVisionAsync (image, sourceLang, targetLang) {
  const body = {
    requests: [
      {
        image: {
          content: image,
        },
        features: [
          {
            type: "TEXT_DETECTION",
            maxResults: 1,
          },
        ],
      },
    ],
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  console.log("callGoogleVisionAsync -> result", result);

  const text = result.responses[0].fullTextAnnotation.text.split("\n").join(" ");
  return text ; 
}

async function callGoogleTranslate (text, sourceLang, targetLang) {
  const API_URL2 = `https://translation.googleapis.com/language/translate/v2?q=${text}&source=${sourceLang}&target=${targetLang}&format=text&key=${API_KEY}`;

  let response2 = await fetch(API_URL2, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  response2 = await response2.json();
  console.log(text);
  console.log(response2);

  return response2.data.translations[0].translatedText;
}

function Camera(props) {
  const [image, setImage] = React.useState(null);
  const [status, setStatus] = React.useState(null);
  const [permissions, setPermissions] = React.useState(false);

  const askPermissionsAsync = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    } else {
      setPermissions(true);
    }
  };

  const takePictureAsync = async () => {
    const { cancelled, uri, base64 } = await ImagePicker.launchCameraAsync({
      base64: true,
    });

    if (!cancelled) {
      setImage(uri);
      setStatus("Loading...");
      try {
        const { sourceLang, targetLang , setTranslation } = props;
        const textFromImage = await callGoogleVisionAsync(base64);
        const translatedResult = await callGoogleTranslate(textFromImage,sourceLang,targetLang)
        setTranslation(textFromImage,translatedResult)
        setStatus(translatedResult);
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    } else {
      setImage(null);
      setStatus(null);
    }
  };
  
  if ( status ) return (<TranslatedText />)
  else return (
    <View style={styles.container}>
      {permissions === false ? (
        <Button onPress={askPermissionsAsync} title="Ask permissions" />
      ) : (
        <>
          {image && <Image style={styles.image} source={{ uri: image }} />}
          <Button onPress={takePictureAsync} title="Take a Picture" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 300,
    height: 300,
  },
  text: {
    margin: 5,
  },
});

const mapState = (state) => {
  return {
    sourceLang: state.language.sourceLang,
    targetLang: state.language.targetLang,
  };
};

const mapDispatch = (dispatch) => {
  return {
    setTranslation : (originalText,translatedText)  => dispatch(setTranslation(originalText,translatedText))
  }
}

export default connect(mapState,mapDispatch)(Camera);
