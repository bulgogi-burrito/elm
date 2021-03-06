import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Button, View } from "react-native";
import { connect } from "react-redux";
import { addToRecents } from "../../store/recentTranslations";
import { callGoogleObject, callGoogleTranslate } from "../google";
import { Styles } from "../utils";
import { ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

function ObjectCamera(props) {
  const navigation = useNavigation();

  const [image, setImage] = React.useState(null);
  const [status, setStatus] = React.useState(null);
  const [sourceObj, setSource] = React.useState(null);
  const [targetObj, setTarget] = React.useState(null);

  const takePictureAsync = async () => {
    const { cancelled, uri, base64 } = await ImagePicker.launchCameraAsync({
      base64: true,
    });

    if (!cancelled) {
      setImage(uri);
      setStatus("Loading...");
      try {
        const { sourceLang, targetLang, addToRecentTranslations } = props;
        let sourceObject = await callGoogleObject(base64);
        if (sourceObject === undefined) {
          setStatus(null);
          return null;
        }
        if (sourceLang !== "en") {
          sourceObject = await callGoogleTranslate(
            sourceObject,
            "en",
            sourceLang
          );
        }

        const targetObject = await callGoogleTranslate(
          sourceObject,
          sourceLang,
          targetLang
        );

        const translationData = {
          content_type: "image",
          input_content: uri,
          input_text: sourceObject,
          source_language: sourceLang,
          translated_text: targetObject,
          target_language: targetLang,
        };
        await addToRecentTranslations(translationData);
        setSource(sourceObject);
        setTarget(targetObject);
        setStatus("Done");
        navigation.navigate("ObjectScreen", {
          sourceObj: sourceObject,
          targetObj: targetObject,
          image: uri,
          sourceLang: sourceLang,
          targetLang: targetLang,
        });
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    } else {
      setImage(null);
      setStatus(null);
      setSource(null);
      setTarget(null);
    }
  };

  if (status === "Loading...")
    return (
      <View style={Styles.container}>
        <ActivityIndicator animating={true} color={"#418fde"} size="large" />
      </View>
    );
  else if (status === "Done" && sourceObj && targetObj) {
    setImage(null);
    setStatus(null);
    setSource(null);
    setTarget(null);
  } else
    return (
      <View style={Styles.container}>
        <Button onPress={takePictureAsync} title="Identify Object" />
      </View>
    );
}

const mapState = (state) => {
  return {
    sourceLang: state.language.sourceLang,
    targetLang: state.language.targetLang,
    cameraPermission: state.permissions.cameraPermission,
  };
};
const mapDispatch = (dispatch) => {
  return {
    addToRecentTranslations: (translationData) =>
      dispatch(addToRecents(translationData)),
  };
};

export default connect(mapState, mapDispatch)(ObjectCamera);
