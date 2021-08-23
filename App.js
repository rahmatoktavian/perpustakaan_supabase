import * as React from 'react';
import { LogBox } from 'react-native';
import FlashMessage from "react-native-flash-message";

//template
import { Provider as PaperProvider } from 'react-native-paper';
import Theme from './config/Theme';

//navigation
import AuthNav from './navigation/AuthNav';
import AnggotaNav from './navigation/AnggotaNav';
import PetugasNav from './navigation/PetugasNav';

//storeApp
import storeApp from './config/storeApp';

LogBox.ignoreAllLogs();

class App extends React.Component {
	constructor(props) {
	  super(props);

	  //get redux variable
	  this.state = storeApp.getState();
	  storeApp.subscribe(()=>{
	    this.setState(storeApp.getState());
	  });

	  this.state = {
	    ...this.state,
	  };
	}

	render() {

		//sudah login
		if(this.state.isLogin == true) {

			//login anggota
			if(this.state.user_type == 'anggota') {
				return (
						<PaperProvider theme={Theme}>
							<AnggotaNav />
							<FlashMessage position="top" floating={true} style={{marginTop:20}} />
						</PaperProvider>
					)

			//login petugas
			} else {
				return (
						<PaperProvider theme={Theme}>
							<PetugasNav />
							<FlashMessage position="top" floating={true} style={{marginTop:20}} />
						</PaperProvider>
					)

			}

		//belum login
		} else {
			return (
				<PaperProvider theme={Theme}>
					<AuthNav />
					<FlashMessage position="top" floating={true} style={{marginTop:20}} />
				</PaperProvider>
			)
		}

	}
}

export default App;
