## Setup

```shell
yarn
```

## Usage

```shell
yarn clean
yarn dev
yarn test
yarn lint
```

#### Gas Reporting

```shell
REPORT_GAS=1 yarn test
```

#### Testing

Requires 2 terminal sessions:

```shell
yarn dev
```

```shell
yarn deploy
```

#### Deployment

```shell
yarn deploy --network [network name]
```

Supported networks:

| name | description |
| ---- | ----------- |
| local | Locally run node: `yarn dev` |
| l14 | Lukso L14 test network |
| l16 | Lukso L16 test network |

##### Configuration

```.env```:
```
OWNER_KEY=[Owner-Private-Key]
```

## Deployments

| network | contract | address |
| ---- | ----------- | ------- |
| l16 | StakedToken | 0x8B7a2d88c47ec68E34Fad73D33F94d281Ef073ce |
| l16 | RewardToken | 0xF7Dc24f4Ac4fA55f913999e12ff84FcE50c22B91 |
| l16 | RelayContractor | 0xadbF26A50ab405350b65b6929Ec5Eb3057Bf6c11 |
