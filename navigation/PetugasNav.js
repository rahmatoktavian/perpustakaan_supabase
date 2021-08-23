import React from 'react';

//stack
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();

//bottom tab
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const BottomTab = createMaterialBottomTabNavigator();

//template
import { Provider as PaperProvider } from 'react-native-paper';
import Theme from '../config/Theme';

//home
import HomeScreen from '../screen/petugas/HomeScreen';

//screen peminjaman: many-many
import PeminjamanListScreen from '../screen/petugas/peminjaman/PeminjamanListScreen';
import PeminjamanBukuListScreen from '../screen/petugas/peminjaman/PeminjamanBukuListScreen';
import PeminjamanBukuInsertScreen from '../screen/petugas/peminjaman/PeminjamanBukuInsertScreen';
import PeminjamanBukuInsertBarcodeScreen from '../screen/petugas/peminjaman/PeminjamanBukuInsertBarcodeScreen';

import PeminjamanInsertScreen from '../screen/petugas/peminjaman/PeminjamanInsertScreen';
import PeminjamanUpdateScreen from '../screen/petugas/peminjaman/PeminjamanUpdateScreen';
import PeminjamanInsertMapScreen from '../screen/petugas/peminjaman/PeminjamanInsertMapScreen';

//laporan
import LaporanScreen from '../screen/petugas/laporan/LaporanScreen';
import ChartPieScreen from '../screen/petugas/laporan/ChartPieScreen';
//laporan supabase
import ReportSummaryScreen from '../screen/petugas/laporan/ReportSummaryScreen';
import ReportDetailScreen from '../screen/petugas/laporan/ReportDetailScreen';

//screen setting: single table
import SettingScreen from '../screen/petugas/setting/SettingScreen';

//screen setting: single table supabase
import AnggotaListScreen from '../screen/petugas/setting/AnggotaListScreen';
import AnggotaInsertScreen from '../screen/petugas/setting/AnggotaInsertScreen';
import AnggotaUpdateScreen from '../screen/petugas/setting/AnggotaUpdateScreen';

//screen setting: 1-many  supabase
import BukuListScreen from '../screen/petugas/setting/BukuListScreen';
import BukuInsertScreen from '../screen/petugas/setting/BukuInsertScreen';
import BukuUpdateScreen from '../screen/petugas/setting/BukuUpdateScreen';

export default function PetugasNav() {
  return (
  	<PaperProvider theme={Theme}>
	    <NavigationContainer>
	      	<BottomTab.Navigator
	      		activeColor="white"
	          	inactiveColor="silver"
	          	barStyle={{backgroundColor:Theme.colors.primary}} 
	          	shifting={false}
	        >	
	        	{/*tab home*/}
	        	<BottomTab.Screen 
							name="Home"
							component={HomeScreen}
							options={{
								tabBarLabel: 'Home',
								tabBarIcon: ({color}) => (<MaterialCommunityIcons name="home" color={color} size={25} />)
							}}
						/>

						{/*tab peminjaman*/}
						<BottomTab.Screen 
							name="PeminjamanListScreen"
							options={{
								tabBarLabel: 'Peminjaman',
								tabBarIcon: ({color}) => (<MaterialCommunityIcons name="clipboard-list" color={color} size={25} />)
							}}
						>
						{() => (
		              	<Stack.Navigator>
				                <Stack.Screen 
				                  name="PeminjamanListScreen"
				                  component={PeminjamanListScreen}
				                  options={{headerShown:false}}
				                />
				                <Stack.Screen 
				                  name="PeminjamanBukuListScreen"
				                  component={PeminjamanBukuListScreen}
				                  options={{headerShown:false}} 
				                />
				                <Stack.Screen 
				                  name="PeminjamanBukuInsertScreen"
				                  component={PeminjamanBukuInsertScreen}
				                  options={{headerShown:false}}
				                />
				                <Stack.Screen 
				                  name="PeminjamanBukuInsertBarcodeScreen"
				                  component={PeminjamanBukuInsertBarcodeScreen}
				                  options={{headerShown:false}}
				                />
				                <Stack.Screen 
				                  name="PeminjamanInsertScreen"
				                  component={PeminjamanInsertScreen}
				                  options={{headerShown:false}}
				                />
				                <Stack.Screen 
				                  name="PeminjamanUpdateScreen"
				                  component={PeminjamanUpdateScreen}
				                  options={{headerShown:false}}
				                />
				                

				                <Stack.Screen 
				                  name="PeminjamanInsertMapScreen"
				                  component={PeminjamanInsertMapScreen}
				                  options={{headerShown:false}}
				                />
										</Stack.Navigator>
						)}
		        </BottomTab.Screen>

		      	{/*tab laporan*/}
						<BottomTab.Screen 
							name="LaporanScreen"
							options={{
								tabBarLabel: 'Laporan',
								tabBarIcon: ({color}) => (<MaterialCommunityIcons name="file" color={color} size={25} />)
							}}
						>
						{() => (
		              		<Stack.Navigator>
				                <Stack.Screen 
				                  name="LaporanScreen"
				                  component={LaporanScreen}
				                  options={{headerShown:false}}
				                />
				                <Stack.Screen 
				                  name="ChartPieScreen"
				                  component={ChartPieScreen}
				                  options={{headerShown:false}}
				                />
				                <Stack.Screen 
				                  name="ReportSummaryScreen"
				                  component={ReportSummaryScreen}
				                  options={{headerShown:false}}
				                />
				                <Stack.Screen 
				                  name="ReportDetailScreen"
				                  component={ReportDetailScreen}
				                  options={{headerShown:false}}
				                />
							</Stack.Navigator>
						)}
		        </BottomTab.Screen>

	        	{/*tab setting*/}
	        	<BottomTab.Screen 
									name="SettingScreen"
									options={{
										tabBarLabel: 'Setting',
										tabBarIcon: ({color}) => (<MaterialCommunityIcons name="cog" color={color} size={25} />)
									}}
								>
								{() => (
				              		<Stack.Navigator>
				              			<Stack.Screen 
						                  name="SettingScreen"
						                  component={SettingScreen}
						                  options={{headerShown:false}}
						                />
						                <Stack.Screen 
						                  name="AnggotaListScreen"
						                  component={AnggotaListScreen}
						                  options={{headerShown:false}}
						                />
						                <Stack.Screen 
						                  name="AnggotaInsertScreen"
						                  component={AnggotaInsertScreen}
						                  options={{headerShown:false}} 
						                />
						                <Stack.Screen 
						                  name="AnggotaUpdateScreen"
						                  component={AnggotaUpdateScreen}
						                  options={{headerShown:false}}
						                />
						                <Stack.Screen 
						                  name="BukuListScreen"
						                  component={BukuListScreen}
						                  options={{headerShown:false}}
						                />
						                <Stack.Screen 
						                  name="BukuInsertScreen"
						                  component={BukuInsertScreen}
						                  options={{headerShown:false}} 
						                />
						                <Stack.Screen 
						                  name="BukuUpdateScreen"
						                  component={BukuUpdateScreen}
						                  options={{headerShown:false}}
						                />
									</Stack.Navigator>
								)}
          </BottomTab.Screen>

	    	</BottomTab.Navigator>
	    </NavigationContainer>
    </PaperProvider>
  );
}