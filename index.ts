// import StegCloak from "stegcloak";
// import {readFileSync,writeFileSync} from "fs"
// import {join} from "path"
import Jimp from "jimp";

const message = "I love Mananasy";
//password collection with the length of the message
const password = "123456789";
let myCollection:{password:string,size:number}[] =[];

hideToImage("original-image.jpg","steg-image.jpg",message,password);

function hideToImage(inputImagePath:string,outputImagePath:string,message:string,password:string){
    const binaryMessage = toBinary(message);
    const binaryMessageSize = binaryMessage.length;
    console.log("original message");    
    console.log(convertBinaryToText(binaryMessage))
    
    
    myCollection.push({password:password,size:binaryMessageSize});
    
    let index = 0;
    Jimp.read(inputImagePath, (err, image) => {
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            if(index < binaryMessage.length){
                const {r,g,b} = Jimp.intToRGBA(image.getPixelColour(x,y));
                // console.log(index);
                const newR = setLSB(r,binaryMessage[index]);
                
                index++;
                // console.log(index);
                const newG = setLSB(g,binaryMessage[index]);
                
                index++;
                // console.log(index);
                const newB = setLSB(b,binaryMessage[index]);
                index++;
                
                const newColor = Jimp.rgbaToInt(newR,newG,newB,255);
                image.setPixelColour(newColor,x,y);
            }
            
        })

        image.write(outputImagePath,()=>{
            console.log("hide message successfully");
            revealFromImage(outputImagePath,password);
            
        })
    
})
}




async function revealFromImage(imagePath: string, password: string) {
  try {
    const image = await Jimp.read(imagePath);
    const messageSize = findSizeByPassword(password);
    let message = "";

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      const { r, g, b } = Jimp.intToRGBA(image.getPixelColour(x, y));
      let rLSB = "";
      let gLSB = "";
      let bLSB = "";

      if (message.length <messageSize) {
        rLSB = getLSB(r);
        message += rLSB;
      }
      if (message.length < messageSize ) {
        gLSB = getLSB(g);
        message += gLSB;
      }
      if (message.length < messageSize ) {
        bLSB = getLSB(b);
        message += bLSB;
      }
    });

    console.log("decoded message");
    console.log(convertBinaryToText(message));
  } catch (error) {
    console.error(error);
  }
}

function findSizeByPassword(password:string){

    for(let i = 0 ; i < myCollection.length ; i++){
        if(myCollection[i].password === password){
            return myCollection[i].size;
        }
    }
    return 0;
}


  function toBinary(message:string){
    const bin = message.split('').map((char)=>char.charCodeAt(0).toString(2).padStart(8,'0')).join('');

    return bin;

  }
  function convertBinaryToText(binary:string){
    return binary.match(/.{8}/g)?.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
  }

  //get the lsb of the pixel
  function getLSB(value:any){
    return (value & 0b00000001).toString();
  }
 
  function setLSB(value:number, bit:string){
    if (bit === '1') {
      return value | 0b11111111; ;
    } else {
      return value & 0b11111110;
    }
  }