import React from "react";
import {
  Text,
  Link,
  HStack,
  Center,
  Heading,
  Switch,
  useColorMode,
  NativeBaseProvider,
  extendTheme,
  VStack,
  Box,
  Icon,
  StatusBar,
  IconButton,
  Button,
  Select,
  CheckIcon,
  Stack,
  FormControl,
  WarningOutlineIcon,
  PresenceTransition,
  Progress,
  TextArea,
} from "native-base";
import * as DocumentPicker from 'expo-document-picker';
import NativeBaseIcon from "./components/NativeBaseIcon";
import { Entypo, AntDesign, FontAwesome5 } from '@expo/vector-icons';


const config = {
  useSystemColorMode: true,
};

export const theme = extendTheme({ config });
type ThemeType = typeof theme;
declare module "native-base" {
  interface MainTheme extends ThemeType { }
}


export default function App() {
  return (
    <NativeBaseProvider theme={theme}>
      <AppBar />
      <Center flex={1}
        _dark={{
          bgColor: "#222",
        }}
      ><ActivityParse /></Center>
      <Footer />

    </NativeBaseProvider>
  );
}

function getIP(json: string, setState: (value: number) => void) {
  let ips: unknown = [];
  let json_lines = json.split("\n");
  let i = 0;

  for (i = 0; i < json_lines.length; i++) {

    try {
      if (i % 1000 == 0) {
        setState({
          value: i / json_lines.length * 100,
          toFixed: function (fractionDigits?: number | undefined): string {
            throw new Error("Function not implemented.");
          },
          toExponential: function (fractionDigits?: number | undefined): string {
            throw new Error("Function not implemented.");
          },
          toPrecision: function (precision?: number | undefined): string {
            throw new Error("Function not implemented.");
          }
        });
      }

      let parsed = JSON.parse(json_lines[i]);
      if (parsed.event_type === "channel_deleted") {
        if (!(ips.indexOf(parsed.ip) > -1)) {
          ips.push(parsed.ip);
        }
      }
    }
    catch (e) {
      console.log('error parsing line ' + e);
    }
  }
  // setValue(100);
  return new Promise((res, rej) => {
    res(ips);
  });

}
function setVal(setValue: (arg0: any) => void, value: any) {
  setValue(value);
}

class ProgressBar extends React.Component {
  constructor(props: {} | Readonly<{}>) {
    super(props);
    this.state = {
      value: 0,
    };
  }

  render() {
    const getIPs = () => {
      fetch(this.props.data).then(res => res.blob()).then(res => {
        res.text().then(text => {
          getIP(text, this.setState).then((ips) => {
            // setIPs(ips);
            // setLoading(false);
          })
        })

      })
    }
    if (this.props.loading) {
      getIPs();
    }
    return (
      <Progress
        color='#f8bb86'
        value={this.state.value}
      />
    );
  }
}

const ProgressValue = ({ setValue, json, loading, setParams, setParsed }) => {

  if (!json) { return <Text>Waiting for data...</Text>; }
  if (json) { if (json.length <= 1) return <Text>Waiting for data...</Text>; }

  React.useEffect(() => {

    let ips = [];
    let os = [];
    let timezones = [];
    let parsed_jsons = [];
    for (let i = 0; i < json.length; i++) {
      try {

        setValue(i / json.length * 100);
        let parsed = JSON.parse(json[i]);
        if (parsed.event_source == "api" && parsed.event_type == "send_message") {
          if (!(ips.indexOf(parsed.ip) > -1)) {
            parsed_jsons.push(parsed);

            if (parsed.ip) {
              ips.push(parsed.ip);
            } else if ((!(ips.indexOf("") > -1))) {
              ips.push("");
            }
            if (!(os.indexOf(parsed.os) > -1)) {
              if (parsed.os) {
                os.push(parsed.os);
              } else if ((!(os.indexOf("") > -1))) {
                os.push("");
              }
            }
            if (!(timezones.indexOf(parsed.time_zone) > -1)) {
              if (parsed.time_zone) {
                timezones.push(parsed.time_zone);
              } else if ((!(timezones.indexOf("") > -1))) {
                timezones.push("");
              }
            }
          }
        }
      }
      catch (e) {
        console.log('error parsing line ' + e);
      }
    }
    timezones.push("All");
    os.push("All");
    ips.push("All");

    setValue(100);
    setParams({
      ips: ips,
      os: os,
      timezones: timezones,
    });
    setParsed(parsed_jsons);
  }, []);

  return (
    <Text>IPS</Text>
  );
}

function ActivityParse() {
  const [json, setJson] = React.useState([{}]);
  const [loading, setLoading] = React.useState(false);
  const [params, setParams] = React.useState({});
  const [isInvalid, setIsInvalid] = React.useState(false);
  const [value, setValue] = React.useState(0);
  const [data, setData] = React.useState(null);
  const [name, setName] = React.useState("");
  const [btnText, setBtnText] = React.useState("Parse");
  const [selected, setSelected] = React.useState({});
  const [jsonLog, setJsonLog] = React.useState("");
  const [parsed, setParsed] = React.useState([]);
  const [showTextBox, setShowTextBox] = React.useState(true);
  const [textValue, setTextValue] = React.useState("");

  React.useEffect(() => {
    if (btnText === 'Loading') {
      // setLoading(true);
      // fetch(data).then(res => res.blob()).then(res => res.text()).then(text => {
      //   setJson(text.split("\n"));
      //   setBtnText('Parse')
      // })
      setJson(data);
      setBtnText('Parse')
      setLoading(false);
    }
  }, [btnText]);

  React.useEffect(() => {
    const filterValues = (obj1: { [x: string]: any; }, obj2: never) => {
      let keys = {
        "ips": "ip",
        "os": "os",
        "timezones": "time_zone",
        "length": "length",
        "num_urls": "num_urls",
        "word_count": "word_count",
      }
      let filtered: never[] = [];
      let include = true;

      for (let i = 0; i < Object.keys(obj1).length; i++) {
        if (obj1[Object.keys(obj1)[i]] == "All") {
          continue
        }
        try {
          for (let j = 0; j < Object.keys(obj2).length; j++) {
            if (Object.keys(obj2)[j] === keys[Object.keys(obj1)[i]]) {
              if (obj2[Object.keys(obj2)[j]] != obj1[Object.keys(obj1)[i]]) {
                include = false;
              }
            }
          }
        } catch (e) {
          console.log(e);
        }

      }
      if (include) {
        filtered.push(obj2);
      }
      return filtered;
    }
    let filtered: any[][] = [];

    parsed.forEach(obj => {
      let result = filterValues(selected, obj);
      if (result) {
        if (result.length > 0) {
          filtered.push(result);
        }
      }
    }
    )
    setJsonLog(JSON.stringify(filtered, null, 2));
  }, [selected])


  return (
    <Stack marginTop={20} marginBottom={20} w={{
      base: '100%',
      sm: '80%',
      md: '70%',
      lg: '65%',
      xl: '50%',
      '2xl': '45%',
    }} borderRadius={10} flexDir='column' alignItems='center'
      _dark={{
        bgColor: '#04293A',
      }}
      _light={{
        bgColor: '#DFF6FF',
      }}
    >
      <Box marginTop={5} marginBottom={2}>
        <UploadBox setLoading={setLoading} setValue={setValue} setJson={setJson} setData={setData} setName={setName} />
      </Box>

      <Box w="90%" minW={{
        base: 200,
        sm: 250,
        md: 300,
        lg: 350,
        xl: 400,
        '2xl': 450,
      }}>

      </Box>
      <PresenceTransition visible={data != null} initial={{
        opacity: 0,
        scale: 0
      }} animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 250
        }
      }}>
        <Stack space={2} flex={1} flexDirection='row' justifyContent='center' alignContent='center' w="90%" minW={{
          base: 200,
          sm: 250,
          md: 300,
          lg: 350,
          xl: 400,
          '2xl': 450,
        }}>

          <Button w={"50%"} isLoadingText="Parsing" onPress={() => {
            setValue(0);
            setBtnText('Loading')
          }
          }
            isLoading={btnText == "Loading"}
          >

            <Text>{btnText}</Text>
          </Button>

        </Stack>
      </PresenceTransition>
      <PresenceTransition visible={loading} initial={{
        opacity: 0,
        scale: 0
      }} animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 250
        }
      }}>
        <Progress marginBottom={5} value={value} />
      </PresenceTransition>



      <PresenceTransition visible={loading} initial={{
        opacity: 0,
        scale: 0
      }} animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 250
        }
      }}>
        <ProgressValue setParsed={setParsed} setParams={setParams} loading={loading} setValue={setValue} json={json} />
        <Box w="90%" minW={{
          base: 200,
          sm: 250,
          md: 300,
          lg: 350,
          xl: 400,
          '2xl': 450,
        }}>
          <Progress marginBottom={5} value={value} />
        </Box>
      </PresenceTransition>

      {!showTextBox && <PresenceTransition visible={Object.keys(json).length > 1} initial={{
        opacity: 0,
        scale: 0
      }} animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 250
        }
      }}>
        <Button marginLeft='auto' marginRight='auto' bgColor="#76BA99" w="50%" marginTop={4} marginBottom={4} onPress={() => setShowTextBox(true)}>Show Text Box</Button>
        <Stack w="100%" justifyContent="center" flexWrap='wrap' margin="4%" direction="row" mb="2.5" mt="1.5" space={3}>
          {Object.keys(params).map((key, index) => {
            try {
              return (
                <Box key={index}>
                  <FormControl key={index} isInvalid={isInvalid}>
                    <FormControl.Label>{key}{' (' + params[`${key}`].length + ')'}</FormControl.Label>
                    <Select key={index} selectedValue={selected[key]} placeholder={`Choose ${key}`} _selectedItem={{
                      bg: "teal.600",
                      endIcon: <CheckIcon size="5" />
                    }} mt={1} onValueChange={(itemValue) => {
                      // filter all values from parsed json by values
                      console.log(selected);
                      if (selected['length']) {
                        setSelected({
                          [key]: itemValue
                        });
                      } else {
                        setSelected({
                          ...selected,
                          [key]: itemValue
                        });
                      }
                    }

                    }>
                      {params[`${key}`].map((val: {} | null | undefined) => (
                        <Select.Item label={val ? val : "null"} value={val}>
                          {val}
                        </Select.Item>
                      ))}
                    </Select>
                    <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                      No selection
                    </FormControl.ErrorMessage>
                  </FormControl>
                </Box>)
            } catch (e) {
              console.log(e);
              return "none";
            }
          })}
        </Stack>

      </PresenceTransition>}

      {(showTextBox && json.length > 1) && <PresenceTransition visible={showTextBox && json.length > 1} initial={{
        opacity: 0,
        scale: 0
      }} animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 250
        }
      }}>
        <Button marginLeft='auto' marginRight='auto' bgColor="#76BA99" w="50%" marginTop={4} marginBottom={4} onPress={() => setShowTextBox(false)}>Show Filters</Button>

        <Box flex={1} alignItems="center">
          <Text>Please input the spam message</Text>
          <TextArea alignItems='flex-start' flexDirection='column' h={{
            base: 200,
            sm: 300,
            md: 350,
            lg: 400,
            xl: 450,
            '2xl': 500,
          }} margin={5} onChangeText={
            (text) => {
              setTextValue(text.trim());
            }
          } value={textValue}
            marginBottom={10}


            w={{
              base: 200,
              sm: 350,
              md: 500,
              lg: 550,
              xl: 650,
              '2xl': 750,

            }}

          />
          <Button onPress={() => {

            let regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
            let text = textValue.split('\n').join(' ');
            console.log(textValue);
            console.log({
              'length': textValue.length,
              'word_count': textValue.split("\n").join(' ').split(' ').length,
              'num_urls': textValue.match(regex) ? textValue.match(regex).length : 0,
            });
            setSelected({
              'length': textValue.length,
              'word_count': textValue.split("\n").join(' ').split(' ').length,
              'num_urls': textValue.match(regex) ? textValue.match(regex).length : 0,
            })
          }
          }>Find Matches</Button>
        </Box>
      </PresenceTransition>}
      <PresenceTransition visible={jsonLog.length > 1 && json.length > 1} initial={{
        opacity: 0,
        scale: 0,
      }} animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 250
        }
      }}>
        <Box marginTop={10} flex={1} alignItems="center">
          <TextArea alignItems='flex-start' flexDirection='column' value={jsonLog}
            marginBottom={10}
            h={{
              base: 200,
              sm: 300,
              md: 400,
              lg: 450,
              xl: 500,
              '2xl': 550,
            }}

            w={{
              base: 200,
              sm: 350,
              md: 500,
              lg: 550,
              xl: 650,
              '2xl': 750,

            }}

          />
        </Box>
      </PresenceTransition>

    </Stack>
  );

}

const UploadBox = ({ setLoading, setValue, setData, setName, setJson }) => {
  const ref = React.useRef(null);
  const [uploaded, setUploaded] = React.useState(false);
  const [draggingIn, setDraggingIn] = React.useState(false);
  let count = 0;

  React.useEffect(() => {
    const div = ref.current;
    // subscribe event
    div.addEventListener('dragenter', handleDragIn)
    div.addEventListener('dragleave', handleDragOut)
    div.addEventListener('dragover', handleDrag)
    div.addEventListener('drop', handleDrop)
  }, []);

  const handleDragIn = (e: { preventDefault: () => void; stopPropagation: () => void; }) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingIn(true);
    count++;
  }
  const handleDragOut = (e: { preventDefault: () => void; stopPropagation: () => void; }) => {
    e.preventDefault();
    e.stopPropagation();
    count--;
    if (count > 0) return;
    setDraggingIn(false);

  }
  const handleDrag = (e: { preventDefault: () => void; stopPropagation: () => void; }) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const handleDrop = (e: { preventDefault: () => void; stopPropagation: () => void; dataTransfer: { files: any[]; }; }) => {
    setLoading(true);
    setDraggingIn(false);
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setValue(e.loaded / e.total * 100);
      }
    }
    reader.onload = (e) => {
      setData(e.currentTarget.result.split('\n'));
      setLoading(false);
    }
    reader.readAsText(file);

  }

  const handleUpload = async () => {
    const { file, name } = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
    });
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setValue(e.loaded / e.total * 100);
        }
      }
      reader.onload = (e) => {
        setData(e.currentTarget.result.split('\n'));
      }
      reader.readAsText(file);
    }
    setName(name);



  }

  return (
    <Box ref={ref} borderStyle={'dashed'} borderWidth={3} borderColor="#155491" borderRadius={10} w={{
      base: 300,
      sm: 300,
      md: 400,
      lg: 430,
      xl: 450,
      '2xl': 470,
    }} h={{
      base: 110,
    }}>


      <VStack space={3} flex={1} justifyContent={'center'} alignContent='center'>
        {!draggingIn && <><Text fontWeight={'bold'} textAlign={'center'}>Drag and Drop or Select Your JSON file</Text>
          <Button
            onPress={handleUpload}
            marginLeft='auto' marginRight='auto' w="50%" leftIcon={<Icon as={Entypo} name="upload" size={{
              base: 8,
              sm: 8,
              md: 6,
              lg: 4,
              xl: 8,

            }} />}><Text fontSize={{
              base: 20,
            }}>
              Upload</Text>
          </Button></>}

        {draggingIn && <Text fontWeight={'bold'} textAlign={'center'}>Drop to Upload</Text>}

      </VStack>
    </Box>
  );
}

function AppBar() {
  return <>
    <StatusBar
      bg="#3700B3" />
    <Box safeAreaTop bg="#6200ee" />
    <HStack _light={{ bg: "#47B5FF" }} _dark={{ bg: "#1a2c51" }} px="1" py="3" justifyContent="space-between" alignItems="center" w="100%">
      <HStack alignItems="center">
        <IconButton icon={<Icon size="xl" as={Entypo} name="menu" _light={{ 'color': '#3F4E4F' }} _dark={{ 'color': 'white' }} />} />
      </HStack>
      <HStack marginRight={5}>
        <ToggleDarkMode />
      </HStack>
    </HStack>
  </>;
}

function Footer() {
  return <>
    <Stack space={2} flexDir='column' alignItems='center' justifyContent='center' _light={{ bg: "#47B5FF" }} _dark={{ bg: "#1a2c51" }} w="100%" h="10%">
      <Text fontSize="sm" textAlign="center">
        Made with ❤️ by <Link isExternal href="https://github.com/oct4pie" fontWeight="bold">oct4pie</Link>
      </Text>
      <HStack space={3}>
        <Link isExternal href="https://github.com/oct4pie/discord-log-parser" fontWeight="bold">
          <Icon _light={{ color: '#2C3639' }} as={AntDesign} name="github" size={10}
          />
        </Link>
        <Link isExternal href="https://discord.gg/R6YdPurrqy" fontWeight="bold">
          <Icon _light={{ color: '#2C3639' }} as={FontAwesome5} name="discord" size={10}
          />
        </Link>
      </HStack>
    </Stack>
  </>;
}


function ToggleDarkMode() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <HStack space={2} alignItems="center">
      <Icon _light={{ color: 'black' }} as={Entypo} name="moon" size={5} />
      <Switch
        isChecked={colorMode === "light"}
        onToggle={toggleColorMode}
        aria-label={
          colorMode === "light" ? "switch to dark mode" : "switch to light mode"
        }
      />
      <Icon _light={{ color: 'black' }} as={Entypo} name="light-up" size={5} />
    </HStack>
  );
}
