import { createStackNavigator } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    Button,
    FlatList, Text, TouchableOpacity, View
} from "react-native";
import Realm from "realm";
import { styles } from '../style';
import { REMOVE } from './actions/action';
import { ProjectContext } from './contexts/ProjectContext';
import ProjectSchema from './contexts/ProjectSchema';
import OpenExisting from './OpenExisting';


const Stack = createStackNavigator();

const ChooseProject = ({ navigation }) => {
    const [projects, setProjects] = useState([])
    const { dispatch } = useContext(ProjectContext)
    async function init() {
        const realm = await Realm.open({
            path: "myproject",
            schema: [ProjectSchema],
        });
        const projects = realm.objects("Project");
        function listener(projects, changes) {
            changes.deletions.forEach((index) => {
                setProjects(projects.map((proj) => proj))
            });
            changes.insertions.forEach((index) => {
                setProjects(projects.map((proj) => proj))
            });
            changes.newModifications.forEach((index) => {
                setProjects(projects.map((proj) => proj))
            });
        }
        projects.addListener(listener);
        setProjects(projects.map((proj) => proj))
    }
    const callback = useCallback(() => init(), [])
    useEffect(() => callback(), [])

    return (
        <View style={styles.container}>
            {
                projects.length > 0 ? <FlatList
                    data={projects}
                    renderItem={({ item }) => (
                        <View style={styles.listContainer}>
                            <Text style={styles.item}>{item.name}</Text>
                            <View style={styles.data}>
                                <Button onPress={() => navigation.navigate('Existing', {
                                    data: JSON.stringify(item)
                                })} title="Ch???nh s???a" />
                            </View>
                            <View style={styles.data}>
                                <Button onPress={() => { dispatch({ type: REMOVE, project: item }) }} title="Xo??" />
                            </View>
                        </View>

                    )}
                    keyExtractor={(item) => item._id}
                /> :
                    <View style={styles.noProjectView}>
                        <Text style={styles.noProjectText}>
                            Ch??a c?? ch????ng tr??nh n??o ???????c l??u. T???o ngay ch????ng tr??nh m???i!
                        </Text>
                        <TouchableOpacity
                            style={styles.buttonMain}
                            onPress={() => navigation.navigate('T???o Ch????ng Tr??nh')}
                        >
                            <Text style={{ color: 'white', }}>T???O CH????NG TR??NH</Text>
                        </TouchableOpacity>
                    </View>
            }
        </View>

    )
}

const ChooseProjectWrapper = ({ navigation }) => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Ch???n Ch????ng Tr??nh C?? S???n" component={ChooseProject} />
            <Stack.Screen options={{ headerShown: false }} name="Existing" component={OpenExisting} />
        </Stack.Navigator>
    )
}

export default ChooseProjectWrapper;
