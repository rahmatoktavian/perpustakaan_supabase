import React, { Component } from 'react';
import { Provider as PaperProvider, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import Theme from '../config/Theme';

class Loading extends Component {

  constructor(props) {
      super(props);
  }

  render() {
  	return (
    	<Portal>
		    <Modal visible={this.props.isLoading}>
		      <ActivityIndicator animating={true} size="large" color={Theme.colors.primary} />
		    </Modal>
		</Portal>
    )
  }

}

export default Loading;




