// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {LFG} from "src/LFG.sol";

contract CounterScript is Script {
    function run() public {
        vm.startBroadcast();
        LFG lfg = new LFG();

        vm.stopBroadcast();
        console2.log("LFG deployed at", address(lfg));
    }
}
