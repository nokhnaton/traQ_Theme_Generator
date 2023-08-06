type RGB = {
  red: number;
  blue: number;
  green: number;
};

type RGBList = {
  data: RGB[][];
  width: number;
  height: number;
};

const imageDataToRGBList = async (imgData: ImageData): Promise<RGBList> => {
  const rgbList: RGBList = {
    data: [[]],
    width: imgData.width,
    height: imgData.height,
  };

  const data = imgData.data;
  for (var i = 0; i < data.length; i += 4) {
    const i_div_4 = i / 4;
    if (i_div_4 % imgData.width == 0)
      rgbList.data[Math.floor(i_div_4 / imgData.width)] = [];
    rgbList.data[Math.floor(i_div_4 / imgData.width)][i_div_4 % imgData.width] =
      {
        red: data[i],
        blue: data[i + 1],
        green: data[i + 2],
      };
  }
  return rgbList;
};

const rgbListToImageData = async (rgbList: RGBList): Promise<ImageData> => {
  const imgData = new ImageData(rgbList.width, rgbList.height);
  const data = imgData.data;

  for (let i = 0; i < rgbList.height; i++) {
    for (let j = 0; j < rgbList.width; j++) {
      const rgb = rgbList.data[i][j];
      const offset = (i * rgbList.width + j) * 4;
      data[offset] = rgb.red;
      data[offset + 1] = rgb.blue;
      data[offset + 2] = rgb.green;
      data[offset + 3] = 255;
    }
  }

  return imgData;
};

export { rgbListToImageData, imageDataToRGBList };
