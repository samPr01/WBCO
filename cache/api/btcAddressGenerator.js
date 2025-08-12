const bitcoin = require('bitcoinjs-lib');
const bip32 = require('bip32');
const bip39 = require('bip39');
const crypto = require('crypto');

class BTCAddressGenerator {
  constructor() {
    // Master seed for generating deterministic addresses
    this.masterSeed = process.env.BTC_MASTER_SEED || this.generateMasterSeed();
    this.network = bitcoin.networks.bitcoin; // Use mainnet
  }

  generateMasterSeed() {
    // Generate a random master seed if not provided
    const mnemonic = bip39.generateMnemonic(256); // 24 words
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    console.log('Generated new master seed. Store this securely:', mnemonic);
    return seed;
  }

  // Generate a unique BTC address for an ETH address
  generateAddressForEthAddress(ethAddress) {
    try {
      // Create a deterministic derivation path based on ETH address
      const ethHash = crypto.createHash('sha256').update(ethAddress.toLowerCase()).digest('hex');
      const derivationIndex = parseInt(ethHash.substring(0, 8), 16) % 2147483647; // Safe modulo
      
      // Derive path: m/44'/0'/0'/0/{derivationIndex}
      const derivationPath = `m/44'/0'/0'/0/${derivationIndex}`;
      
      // Generate the key pair
      const root = bip32.fromSeed(this.masterSeed, this.network);
      const child = root.derivePath(derivationPath);
      
      // Generate the address
      const { address } = bitcoin.payments.p2pkh({
        pubkey: child.publicKey,
        network: this.network
      });

      return {
        address,
        derivationPath,
        publicKey: child.publicKey.toString('hex'),
        privateKey: child.toWIF() // Be careful with this in production
      };
    } catch (error) {
      console.error('Error generating BTC address:', error);
      throw new Error('Failed to generate BTC address');
    }
  }

  // Validate BTC address
  validateAddress(address) {
    try {
      bitcoin.address.toOutputScript(address, this.network);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get address info (for debugging)
  getAddressInfo(address) {
    try {
      const script = bitcoin.address.toOutputScript(address, this.network);
      return {
        address,
        script: script.toString('hex'),
        type: 'p2pkh',
        network: 'bitcoin'
      };
    } catch (error) {
      throw new Error('Invalid BTC address');
    }
  }

  // Generate test address (for development)
  generateTestAddress() {
    const testEthAddress = '0x' + crypto.randomBytes(20).toString('hex');
    return this.generateAddressForEthAddress(testEthAddress);
  }
}

module.exports = BTCAddressGenerator;
