import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CartItem } from '@prisma/client';
import { FilesService } from 'src/common/services/file.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendgridService } from 'src/common/services/send-emails.service';

@Injectable()
export class OrderCreatedListener {
  constructor(
    private prisma: PrismaService,
    private sendgridService: SendgridService,
    private fileService: FilesService,
  ) {}
  @OnEvent('order.created')
  async handledOrderCreatedEvent(items) {
    const ids = items.map((item) => item.product.id);

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: ids },
        stock: {
          lte: 3,
          gt: 0,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        image: true,
        like: {
          orderBy: {
            updatedAt: 'desc',
          },
          where: {
            like: true,
          },
          select: {
            updatedAt: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (products?.length) {
      for (let i = 0; i < products.length; i++) {
        const users = products[i].like.map((lk) => lk.user);

        if (!users.length) {
          continue;
        }

        for (let j = 0; j < users.length; j++) {
          const order = await this.prisma.order.findFirst({
            orderBy: {
              createdAt: 'desc',
            },
            where: {
              userId: users[j].id,
              orderItem: {
                some: {
                  productId: products[i].id,
                },
              },
            },
          });

          if (!order) {
            let urls = [];

            if (products[i].image?.length) {
              urls = await Promise.all(
                products[i].image.map(
                  async (img) =>
                    await this.fileService.generatePresignedUrl(
                      `${img.uuid}.${img.type}`,
                    ),
                ),
              );
            }

            const mail = {
              to: users[j].email,
              subject: `${products[i].name} only have ${products[i].stock} unit(s) in stock!!`,
              text: 'Email to notify client about a product',
              html: `
              <h1>${products[i].name.toUpperCase()}</h1>
              <h3>${products[i].description}. Price: $ ${products[
                i
              ].price.toFixed(2)} and Stock: ${products[i].stock} </h3><br>
              `,
            };

            for (let i = 0; i < urls.length; i++) {
              mail.html += `<img src="${urls[i]}" width="388"/>`;
            }

            await this.sendgridService.send(mail);
            break;
          }
        }
      }
    }
  }
}
