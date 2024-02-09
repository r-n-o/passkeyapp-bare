/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { Buffer } from "buffer";
import { createHash } from "sha256-uint8array";
import { Passkey } from "react-native-passkey";

const RPID = "passkeyapp.tkhqlabs.xyz"


type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Create a Passkey">
            <Button title='Create Passkey' onPress={onPasskeyCreate}></Button>
          </Section>
          <Section title="Use your Passkey">
            <Button title='Sign with Passkey' onPress={onPasskeySignature}></Button>
          </Section>
          <Section title="See Your Changes">
            <Button title='Sign with Passkey' onPress={onPasskeySignature}></Button>
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

async function onPasskeyCreate() {
  // Check that challenge generation works, and passkeys are supported
  console.log(getChallengeFromPayload("hello"));
  console.log("random challenge", getRandomChallenge());
  console.log("support", Passkey.isSupported());
  console.log("registering a passkey with RPID set to", RPID)
  try {
    const result = await Passkey.register(
      {
        challenge: getChallengeFromPayload("hello"),
        rp: {
          id: RPID,
          name: "Passkey App",
        },
        user: {
          id: "new-id",
          name: "New Passkey",
          displayName: "New Passkey",
        },
        excludeCredentials: [],
        authenticatorSelection: {
          requireResidentKey: true,
          residentKey: "required",
          userVerification: "preferred",
        },
        attestation: "none",
        extensions: {},
        // All algorithms can be found here: https://www.iana.org/assignments/cose/cose.xhtml#algorithms
        // We only support ES256 and RS256, which are listed below
        pubKeyCredParams: [
          {
            type: "public-key",
            alg: -7,
          },
          {
            type: "public-key",
            alg: -257,
          },
        ],
      }
    );
    console.log(result);
  } catch(e) {
    console.error("error during passkey creation", e);
  }
}

async function onPasskeySignature() {
  try {
    const result = await Passkey.authenticate({
      rpId: RPID,
      challenge: getChallengeFromPayload("test payload")
    });
    console.log("success", result);
  } catch(e) {
    console.error("error during passkey signature", e);
  }
}

// Needs to return a base64-encoded string
function getChallengeFromPayload(payload: string): string {
  const hexString = createHash().update(payload).digest("hex");
  const hexBuffer = Buffer.from(hexString, "utf8");
  return hexBuffer.toString("base64");
}

// Function to return 32 random bytes encoded as hex
// (e.g "5e4c2c235fc876a9bef433506cf596f2f7db19a959e3e30c5a2d965ec149d40f")
// This function doesn't return strong cryptographic randomness (Math.random is a PRNG), but this is good enough for registration challenges.
// If the challenge was not random at all the risk is that someone can replay a previous signature to register an authenticator they don't own.
// However:
// - we are creating a brand new authenticator here, which means keygen is happening right as we call this library (which makes the replay attack hard-to-impossible)
// - even if a replay attack went through, the authenticator wouldn't be usable given Turnkey has anti-replay in place in activity payloads (timestamp field)
// Generating challenges with Math.random lets us avoid a dependency on webcrypto/polyfills.
function getRandomChallenge(): string {
  let randomHexChars: string[] = [];
  const hexChars = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
  ];

  for (let i = 0; i < 64; i++) {
    randomHexChars.push(hexChars[Math.floor(Math.random() * 16)]!);
  }
  return randomHexChars.join("");
}


const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
