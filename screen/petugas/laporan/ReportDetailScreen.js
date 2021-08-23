import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import { Provider as PaperProvider, Appbar, TextInput, DataTable, Portal, Dialog, Modal, ActivityIndicator, Button, List, HelperText } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing'

import supabase from '../../../config/supabase';
import Theme from '../../../config/Theme';

import dateFormatDB from '../../../component/dateFormatDB';
import dateFormat from '../../../component/dateFormat';
import Loading from '../../../component/Loading';

class SupaReportDetailScreen extends Component {

  constructor(props) {
      super(props);

      this.state = {
        data: [],

        displayFilter: true,

        displayDateTimePickerMulai: false,
        displayDateTimePickerAkhir: false,
        petugas_data: [],

        petugas_id: 0,
        nama_anggota: '',

        //default: tanggal hari ini
        tanggal_pinjam_mulai: new Date(),
        tanggal_pinjam_akhir: new Date(),
      }
  }

  componentDidMount() {
      this._unsubscribe = this.props.navigation.addListener('focus', () => {
        this.getData();
        this.getPetugasData();
      });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  async getPetugasData() {
      this.setState({isLoading:true});

      //query data supabase
      const { data, error } = await supabase
                                    .from('petugas')
                                    .select('*')
                                    .order('nama', {ascending:true})
     
      //memasukan respon ke state untuk loop data di render
      this.setState({petugas_data:data, isLoading:false});
  }

  async getData() {

      //filter petugas
      let filterPetugas = 'neq';
      if(this.state.petugas_id != 0) {
        filterPetugas = 'eq';
      }
 
      //query data supabase
      const { data, error } = await supabase
                                    .from('peminjaman')
                                    .select('*, anggota:nim(nama), petugas:petugas_id(nama)')
                                    .gte('tanggal_pinjam', dateFormat(this.state.tanggal_pinjam_mulai))
                                    .lte('tanggal_pinjam', dateFormat(this.state.tanggal_pinjam_akhir))
                                    .ilike('anggota.nama', '%'+this.state.nama_anggota+'%')
                                    .filter('petugas_id', filterPetugas, this.state.petugas_id)
                                    .order('nama', {foreignTable:'anggota'})

      //memasukan respon ke state
      this.setState({data:data, isLoading:false});
  }

  async getDataRPC() {
      //query data supabase
      const { data, error } = await supabase
                                    .rpc('detil_peminjaman', {
                                      tanggal_pinjam_mulai_filter: dateFormat(this.state.tanggal_pinjam_mulai),
                                      tanggal_pinjam_akhir_filter: dateFormat(this.state.tanggal_pinjam_akhir),
                                      nama_anggota_filter: this.state.nama_anggota,
                                      petugas_id_filter: this.state.petugas_id,
                                    });
                                  

      //memasukan respon ke state
      this.setState({data:data, isLoading:false});
  }

  async onExportPDF() {
    let content = '';

    content += '<h3 style="text-align:center;">Rekap Buku per Kategori</h3>';
    content += '<table style="width:100%;">';

    content += '<tr>';
      content += '<td><strong>Anggota</strong></td>';
      content += '<td><strong>Petugas</strong></td>';
      content += '<td><strong>Tgl Pinjam</strong></td>';
      content += '<td><strong>Tgl Batas Kembali</strong></td>';
    content += '</tr>';

    this.state.data && this.state.data.map(row => {
      content += '<tr>';
        content += '<td>'+row.nama_anggota+'</td>';
        content += '<td>'+row.nama_petugas+'</td>';
        content += '<td>'+dateFormatDB(row.tanggal_pinjam)+'</td>';
        content += '<td>'+dateFormatDB(row.tanggal_batas_kembali)+'</td>';
      content += '</tr>';
    })
    content += '</table>';
    content += '<style>th, td {border: 1px solid black;border-collapse: collapse;}</style>';

    let response = await Print.printToFileAsync({
      html: content
    });

    Sharing.shareAsync(response.uri);
  }

  onFilter() {
    //nutup portal
    this.setState({displayFilter:false});

    //refresh data laporan
    this.getData();
  }

  render() {
      return (
        <PaperProvider theme={Theme}>
          <Appbar.Header>
            <Appbar.Action icon="arrow-left" onPress={() => this.props.navigation.goBack()} />
            <Appbar.Content title="Detil Peminjaman" />
            <Appbar.Action icon="magnify" onPress={() => this.setState({displayFilter:true})} />
          </Appbar.Header>

          <ScrollView>

          {/*table versi android*/}
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Anggota</DataTable.Title>
              <DataTable.Title>Petugas</DataTable.Title>
              <DataTable.Title>Tgl Pinjam</DataTable.Title>
              <DataTable.Title>Tgl Batas Kembali</DataTable.Title>
            </DataTable.Header>
            
            {/*loop data state*/}
            {this.state.data && this.state.data.map((row, key) => (
              ((row.anggota != null && row.petugas != null) &&
              <DataTable.Row key={key}>
                <DataTable.Cell>{row.anggota.nama}</DataTable.Cell>
                <DataTable.Cell>{row.petugas.nama}</DataTable.Cell>
                <DataTable.Cell>{dateFormatDB(row.tanggal_pinjam)}</DataTable.Cell>
                <DataTable.Cell>{dateFormatDB(row.tanggal_batas_kembali)}</DataTable.Cell>
              </DataTable.Row>
              )
            ))}
            {/*end loop*/}

          </DataTable>
          </ScrollView>

          {/*export pdf*/}
          {this.state.data &&
          <Button 
              mode="outlined" 
              icon="download" 
              onPress={() => this.onExportPDF()}
              style={{margin:20}}
          >
            Export PDF
          </Button>
          }

          <Loading isLoading={this.state.isLoading} />

          {/*filter*/}
          <Portal>
            <Dialog
              visible={this.state.displayFilter} 
              onDismiss={() => this.setState({displayFilter:false})} 
            >
              <Dialog.Title>Filter</Dialog.Title>
              <Dialog.ScrollArea>

                  {/*tgl pinjam mulai*/}
                  <HelperText style={{marginBottom:-20}}>Tanggal Pinjam Mulai</HelperText>
                  <List.Item
                      title={dateFormat(this.state.tanggal_pinjam_mulai)}
                      right={() => <List.Icon icon="calendar" />}
                      onPress={() => this.setState({displayDateTimePickerMulai:true})}
                  />

                  {this.state.displayDateTimePickerMulai && (
                      <DateTimePicker
                        value={this.state.tanggal_pinjam_mulai}
                        display="calendar"
                        onChange={(event,date) => this.setState({displayDateTimePickerMulai:false, tanggal_pinjam_mulai:date})}
                      />
                  )}

                  {/*tgl pinjam akhir*/}
                  <HelperText style={{marginBottom:-20}}>Tanggal Pinjam Akhir</HelperText>
                  <List.Item
                      title={dateFormat(this.state.tanggal_pinjam_akhir)}
                      right={() => <List.Icon icon="calendar" />}
                      onPress={() => this.setState({displayDateTimePickerAkhir:true})}
                  />

                  {this.state.displayDateTimePickerAkhir && (
                      <DateTimePicker
                        value={this.state.tanggal_pinjam_akhir}
                        display="calendar"
                        onChange={(event,date) => this.setState({displayDateTimePickerAkhir:false, tanggal_pinjam_akhir:date})}
                      />
                  )}

                  {/*anggota*/}
                  <TextInput
                    label="Nama Anggota"
                    value={this.state.nama_anggota}
                    onChangeText={text => this.setState({nama_anggota:text})}
                    style={{marginLeft:5, marginTop:-20, backgroundColor:'white'}}
                  />

                  {/*petugas*/}
                  <HelperText style={{marginBottom:-20}}>Petugas</HelperText>
                  <Picker
                    selectedValue={this.state.petugas_id}
                    onValueChange={(itemValue, itemIndex) => this.setState({petugas_id:itemValue})}
                    style={{margin:10}}
                    mode='dropdown'
                  >
                    <Picker.Item label="Semua Petugas" value="" />
                    {/*loop data state*/}
                    {this.state.petugas_data.map((row,key) => (
                      <Picker.Item key={key} label={row.nama} value={row.id} />
                    ))}
                    {/*end loop*/}
                  </Picker>

              </Dialog.ScrollArea>

              <Dialog.Actions style={{ justifyContent:'flex-start', marginLeft:20}}>
                <Button icon="magnify" mode="contained" onPress={() => this.onFilter()}>Filter</Button>
                <Button icon="cancel" onPress={() => this.setState({displayFilter:false})}>Batal</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
          {/*end filter*/}

          <Loading isLoading={this.state.isLoading} />
        </PaperProvider>
      )
  }
}

export default SupaReportDetailScreen;