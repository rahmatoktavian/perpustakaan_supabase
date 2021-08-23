import * as React from 'react';
import { ScrollView, View, FlatList, Alert, Text } from 'react-native';
import { Provider as PaperProvider, Appbar, TextInput, Button, HelperText } from 'react-native-paper';
import ValidationComponent from 'react-native-form-validator';
import { showMessage } from "react-native-flash-message";

import supabase from '../../../config/supabase.js';
import Theme from '../../../config/Theme.js';
import store from '../../../config/storeApp';
import dateFormatDB from '../../../component/dateFormatDB';
import Loading from '../../../component/Loading';

class PeminjamanUpdateScreen extends ValidationComponent {

	constructor(props) {
	    super(props);

	    this.state = store.getState();
	    store.subscribe(()=>{
	      this.setState(store.getState());
	    });

	    this.state = {
	    	...this.state,

	    };

	}

	componentDidMount() {
      this._unsubscribe = this.props.navigation.addListener('focus', () => {
        this.fetchData();
      });
  	}

    componentWillUnmount() {
    	this._unsubscribe();
    }

	async fetchData() {
		this.setState({isLoading:true})

		let id = this.props.route.params.id;

    const { data, error } = await supabase
                          .from('peminjaman')
                          .select('id, anggota:nim (nama), tanggal_pinjam, tanggal_batas_kembali')
                          .eq('id', id)
                          .single()

		this.setState({
			nama:data.anggota.nama,
			tanggal_pinjam:data.tanggal_pinjam,
			tanggal_batas_kembali:data.tanggal_batas_kembali,
			isLoading:false
		});

	}

	onDeleteConfirm() {
	    Alert.alert(
	      "Warning",
	      "Data will be deleted?",
	      [
	        { text: "Cancel" },
	        { text: "OK", onPress: () => this.onDelete(this.props.route.params.id) }
	      ],
	    );
	}

	async onDelete(id) {
		this.setState({isLoading:true})

		let response = await supabase
						.from('peminjaman')
						.delete()
						.eq('id', id);

		//notif
		if(response.error) {
			showMessage({
          message: error.message,
          type: 'danger',
          icon: 'danger',
        });
		} else {
			showMessage({
          message: 'Data berhasil ditambah',
          type: 'success',
          icon: 'success',
        });
		}

		this.setState({isLoading:false})

		this.props.navigation.navigate('PeminjamanListScreen');
	}


	render() {
	    return (
	    	<PaperProvider theme={Theme}>
			    <Appbar.Header>
			      <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
			      <Appbar.Content title="Peminjaman Update" />
			    </Appbar.Header>

				  	<TextInput
					    label="Nama"
					    value={this.state.nama}
					    disabled
				    />
				    <TextInput
					    label="Tangal Pinjam"
					    value={dateFormatDB(this.state.tanggal_pinjam)}
					    disabled
				    />
				    <TextInput
					    label="Tanggal Batas Kembali"
					    value={dateFormatDB(this.state.tanggal_batas_kembali)}
					    disabled
				    />

			    <Button
			    	mode="contained"
			    	icon="content-save-outline"
			    	onPress={() => this.onDeleteConfirm()}
			    	disabled={this.state.isLoading}
			    	style={{ marginHorizontal:10, marginTop:5 }}
			    >
				    Hapus
				</Button>


			</PaperProvider>
	    )
	}
}

export default PeminjamanUpdateScreen;
