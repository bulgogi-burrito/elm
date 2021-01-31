import React from 'react'
import { connect } from 'react-redux';
import {Picker , View , Text } from 'react-native' ; 
import {changeSourceLang, changeTargetLang} from '../store/settings'
import Home from './home'


class Settings extends React.Component {


    render () {
        const { sourceLang, targetLang } = this.props;
        return (
            <View>
               
              <Picker 
                selectedValue={sourceLang}
                onValueChange={ (language) => {
                    this.props.changeSource(language)
                } }
                style={{ width: '100%' }}
              >
                <Picker.Item label="English" value="en" />
                <Picker.Item label="Spanish" value="es" />
                <Picker.Item label="Korean" value="ko" />
              </Picker>  
              
              <Picker 
              selectedValue={targetLang}
              onValueChange={ (language) => {
                  this.props.changeTarget(language)
              } }
              style={{ width: '100%' }}
            >
              <Picker.Item label="English" value="en" />
              <Picker.Item label="Spanish" value="es" />
              <Picker.Item label="Korean" value="ko" />
            </Picker>  
            </View>
              )
    }
}

const mapState = (state) => {
    return {
        sourceLang : state.sourceLang , 
        targetLang : state.targetLang , 
    }
}

const mapDispatch = (dispatch) => {
    return {
        changeSource : (newSource) => { dispatch(changeSourceLang(newSource)) } , 
        changeTarget : (newTarget) => { dispatch(changeTargetLang(newTarget)) } 
    }
}

export default connect (mapState,mapDispatch) (Settings) 