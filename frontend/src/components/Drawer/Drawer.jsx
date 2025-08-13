import * as React from "react";
import Box from "@mui/joy/Box";
import Drawer from "@mui/joy/Drawer";
import List from "@mui/joy/List";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import FeaturesPanel from "../FeaturesPanel";
import { Menu } from 'lucide-react'
import { Options } from "../Options";

export default function DrawerBasic() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (inOpen) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setOpen(inOpen);
  };

  return (
    <Box sx={{ display: "flex" }} >
      {/* <img src="/menu.svg" alt="" className="w-8 mb-1 mr-0 z-10" onClick={toggleDrawer(true)} /> */}
      <div className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 p-2 px-4" onClick={toggleDrawer(true)}>
        <Menu className=" h-5 w-5"  />
        <span className="text-lg text-white/90">Menu</span>
      </div>
      
      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        anchor="left"
        color="neutral"
        invertedColors={true}
        size="sm"
        variant="soft"
       
      >
        <Box
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
          sx={{
            backgroundColor: "#111111",
            height: "100vh",
            width: "100%",
          }}
        >
          <div className="w-[80%] mt-4 scale-125 flex justify-end items-center">
            <KeyboardArrowRightIcon
              id="close-icon"
              sx={{
                width:'30px',
                height:'30px',
                backgroundColor: "#ffffff1e",
                borderRadius: "100%",
                color:'#6054aa',
                ":hover":{
                  backgroundColor: "#1e1e20"
                }
              }}
            />
          </div>
          <List>
            <div className="mt-10 w-[90%] flex flex-col gap-4">
               <Options />
                <FeaturesPanel drawer="drawer" />
                </div>
                 
           
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}