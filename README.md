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
| l16 | RewardToken | 0x07eE2b1135654dC9b83eF72EEA15d1C32C902dD4 |
| l16 | RelayContractor | 0x93D1B49d28763a83ADB54D0069b91BdDa264a50e |
